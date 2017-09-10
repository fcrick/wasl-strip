var load = require("assemblyscript-loader").load;
var mem = new WebAssembly.Memory({initial:1, maximum: 1})

var columns = [
  'Alex',
  'Kindra',
  'Camberley',
  'Francis',
]

Buffer.from(mem.buffer, 0, 4).write('Alxe')

load("./strip.wasm", {
  imports: {
    js: {
      included: (offset, length) => {
        console.log(offset)
        console.log(length)
        return columns.indexOf(Buffer.from(mem.buffer, offset, length).toString('utf8'))
      },
      yes: () => console.log('yes'),
      no: () => console.log('no'),
    }
  },
  memory: mem
}).then(module => {
  console.log(module.exports.strip2(0))
});