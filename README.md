This is a Discord bot which will speak over your friends.
In the `.env`, provide a user (`VICTIM`) and an audio file (`AUDIO`).
When started, the bot should (you think I tested this?) join any voice channel the user joins and interupt them by playing the audio whenever the user is speaking.

I recommend you use a long or looped audio as it will (un)pause a single audio and probably crash if it reaches the end of the audio.
You can use `ffmpeg` to loop an audio trivially:

```sh
ffmpeg -stream_loop 99 -i input.opus -c copy looped.opus
```

### Running

- Copy `.env.template` to `.env`.
- `BOT_TOKEN` is the bot token (duh).
- `VICTIM` is a user ID. Turn on dev mode in Discord, right click someone, and click "Copy User ID".
- `AUDIO` is an audio file. It probably needs to be a `.opus`.
- `$ npm i; npm run start`
