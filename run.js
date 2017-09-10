var load = require("assemblyscript-loader").load;
var mem = new WebAssembly.Memory({initial:1, maximum: 1})

var columns = [
  'Alex',
  'Kindra',
  'Camberley',
  'Francis',
]

var doc = 'Alex,"Francis",Michael\n1,2,3\n'
console.log('length is ' + doc.length)

// console.log('test')
// console.log(Buffer.from(mem.buffer, 0, doc.length).toString('utf8'))

var onDone, onIncluded

load("./strip.wasm", {
  imports: {
    js: {
      included: (start, end) => onIncluded(start, end),
      debug: num => {
        console.log(num)
        console.log(String.fromCharCode(num))
      },
      done: length => {
        console.log('done ' + length)
        onDone(length)
      }
    }
  }
}).then(module => {
  onDone = length => console.log(Buffer.from(module.memory.buffer, 0, length).toString('utf8'))
  onIncluded = (start, end) => {
    var header = Buffer.from(module.memory.buffer, start, end - start).toString('utf8')
    header = header.replace(/^"(.+(?="$))"$/, '$1')
    console.log(`header is "${header}"`)
    var result = columns.indexOf(header)
    console.log('returning ' + result)
    return result
  }

  Buffer.from(module.memory.buffer, 0, doc.length).write(doc)
  console.log(module.exports.strip(doc.length))
});