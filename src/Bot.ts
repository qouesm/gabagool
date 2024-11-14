import {
  createAudioPlayer,
  createAudioResource,
  DiscordGatewayAdapterCreator,
  getVoiceConnection,
  joinVoiceChannel,
  NoSubscriberBehavior,
  VoiceConnection,
  VoiceConnectionStatus,
} from "@discordjs/voice";
import { Client, Events } from "discord.js";
import "dotenv/config";

const AUDIO = process.env.AUDIO!;
const BOT_TOKEN = process.env.BOT_TOKEN!;
const VICTIM = process.env.VICTIM!;

console.log("Bot is starting...");

const client = new Client({
  intents: ["GuildVoiceStates"],
});

client.login(BOT_TOKEN);
client.once(Events.ClientReady, (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on(Events.VoiceStateUpdate, (oldState, newState) => {
  if (newState.member!.user.id != VICTIM) return;

  if (newState.channelId === null) {
    console.log(oldState.member!.user.tag, "left channel", oldState.channelId);
    const con = getVoiceConnection(newState.guild.id);
    if (!con) {
      console.log("tried to leave but not in vc");
      return;
    }
    con.destroy();
    console.log("disconnected");
  } else if (oldState.channelId === null) {
    console.log(
      newState.member!.user.tag,
      "joined channel",
      newState.channelId,
    );
    const con = joinVoiceChannel({
      channelId: newState.channelId,
      guildId: newState.guild.id,
      adapterCreator: newState.guild
        .voiceAdapterCreator as unknown as DiscordGatewayAdapterCreator,
      selfDeaf: false,
      selfMute: false,
    });
    con.on(VoiceConnectionStatus.Ready, () => {
      console.log(
        "The connection has entered the Ready state - ready to play audio!",
      );
      bullshit(con);
    });
  } else {
    console.log(
      newState.member!.user.tag,
      "moved channels",
      oldState.channelId,
      newState.channelId,
    );
    const oldCon = getVoiceConnection(newState.guild.id);
    if (!oldCon) {
      console.log("tried to leave but not in vc");
      return;
    }
    oldCon.destroy();
    const con = joinVoiceChannel({
      channelId: newState.channelId!,
      guildId: newState.guild.id,
      adapterCreator: newState.guild
        .voiceAdapterCreator as unknown as DiscordGatewayAdapterCreator,
      selfDeaf: false,
      selfMute: false,
    });
    con.on(VoiceConnectionStatus.Ready, () => {
      console.log(
        "The connection has entered the Ready state - ready to play audio! (moved)",
      );
      bullshit(con);
    });
  }
});

const bullshit = (con: VoiceConnection) => {
  const resource = createAudioResource(AUDIO);

  const player = createAudioPlayer({
    behaviors: {
      noSubscriber: NoSubscriberBehavior.Pause,
    },
  });
  const sub = con.subscribe(player);
  let first = true;

  const startDebounce = 150;
  const endDebounce = 500;
  let startTimer: NodeJS.Timeout | undefined;
  let endTimer: NodeJS.Timeout | undefined;

  const speakMap = con.receiver.speaking;

  speakMap.on("start", (id) => {
    if (first) {
      player.play(resource);
      first = false;
    }
    if (id === VICTIM) {
      if (startTimer) {
        clearTimeout(startTimer);
      }
      startTimer = setTimeout(() => {
        player.unpause();
      }, startDebounce);
    }
  });

  speakMap.on("end", (id) => {
    if (id === VICTIM) {
      if (endTimer) {
        clearTimeout(endTimer);
      }
      endTimer = setTimeout(() => {
        player.pause();
      }, endDebounce);
    }
  });
};
