import Fastify from 'fastify'

const debounceP = <A extends any[], R>(am: number, fn: (...args: A) => R) => {
  let timeout
  return (...args: A) => {
    if (last >= am) {
      last
      return fn(...args)
    }
  }
}

// const f = Fastify({})

// const run = async ({ port, host }: { port: number; host?: string }) => {
//   f.get('/', (req, res) => res.send('hello'))

//   await f.listen({ port, host })
// }

// run({ port: 3001 })
// import ffmpeg from "fluent-ffmpeg";
// import ts from "torrent-stream";
// import wt from "webtorrent";
// import util from "util";
// import path from "path";
// import fs from "fs";

// const source =
//   "magnet:?xt=urn:btih:A00A4517189A77617660E480F40120943F0DC24B&dn=The%20Last%20of%20Us%20S01E03%201080p%20WEB%20H264-CAKES&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A6969%2Fannounce&tr=udp%3A%2F%2F9.rarbg.to%3A2710%2Fannounce&tr=udp%3A%2F%2F9.rarbg.me%3A2780%2Fannounce&tr=udp%3A%2F%2F9.rarbg.to%3A2730%2Fannounce&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=http%3A%2F%2Fp4p.arenabg.com%3A1337%2Fannounce&tr=udp%3A%2F%2Ftracker.torrent.eu.org%3A451%2Fannounce&tr=udp%3A%2F%2Ftracker.tiny-vps.com%3A6969%2Fannounce&tr=udp%3A%2F%2Fopen.stealth.si%3A80%2Fannounce";

// const meta = (input: string) => util.promisify(ffmpeg.ffprobe)(input);

// const root = path.join(__dirname, "../");

// const engine = ts(source, {
//   tmp: path.join(root, "/downloads"), // Root folder for the files storage.
//   path: path.join(root, "/downloads/files"), // Where to save the files. Overrides `tmp`.
// });

// engine.on("ready", function () {
//   engine.files.forEach(function (file) {
//     const stream = file.createReadStream();
//     const convert = ffmpeg()
//       .input(stream)
//       .output(path.join(root, "downloads/convert", file.name))
//       .videoCodec("libx264")
//       .audioCodec("aac")
//       .addOption([
//         "-threads 1", // 0
//         "-crf 22", // https://trac.ffmpeg.org/wiki/Encode/H.264#a1.ChooseaCRFvalue
//         //'-movflags faststart', // https://superuser.com/questions/438390/creating-mp4-videos-ready-for-http-streaming
//         "-preset veryfast", // https://trac.ffmpeg.org/wiki/Encode/H.264#a2.Chooseapreset
//         "-tune zerolatency", // https://superuser.com/a/564404,
//         "-movflags isml+frag_keyframe+empty_moov+faststart", //+dash
//         "-f ismv",

//         // Probably don't need this as we are outputing to a temp file
//         "-maxrate 2500k", // https://trac.ffmpeg.org/wiki/EncodingForStreamingSites#a-maxrate
//         "-bufsize 5000k", // https://trac.ffmpeg.org/wiki/EncodingForStreamingSites#a-bufsize
//       ])
//       .format("mp4");
//     // const write = fs.createWriteStream(
//     //   path.join(__dirname, `../downloads/${file.name}`),
//     //   stream
//     // );

//     console.log(file.length, file.name, file.path);
//     // var stream = file.createReadStream();
//     // stream is readable stream to containing the file content
//   });
// });
// engine.on("ready", () => {
//   console.log("ready");
// });

// engine.on("idle", () => {
//   console.log("idle");
// });
// engine.on("torrent", () => {
//   console.log("torrent");
// });
// engine.on("download", (p) => {
//   console.log("download", p);
// });
// engine.on("upload", (p) => {
//   console.log("upload", p);
// });
// // yarn pnpify webtorrent "magnet:?xt=urn:btih:A00A4517189A77617660E480F40120943F0DC24B&dn=The%20Last%20of%20Us%20S01E03%201080p%20WEB%20H264-CAKES&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A6969%2Fannounce&tr=udp%3A%2F%2F9.rarbg.to%3A2710%2Fannounce&tr=udp%3A%2F%2F9.rarbg.me%3A2780%2Fannounce&tr=udp%3A%2F%2F9.rarbg.to%3A2730%2Fannounce&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=http%3A%2F%2Fp4p.arenabg.com%3A1337%2Fannounce&tr=udp%3A%2F%2Ftracker.torrent.eu.org%3A451%2Fannounce&tr=udp%3A%2F%2Ftracker.tiny-vps.com%3A6969%2Fannounce&tr=udp%3A%2F%2Fopen.stealth.si%3A80%2Fannounce" --vlc
