// function strcmp(a: utf8String, b: utf8String): i32 {
//     let i: usize = 0
//     while (true) {
//         var aChr: i8 = load<i8>(a.start + i)
//         var bChr: i8 = load<i8>(b.start + i)
//         if (aChr != bChr) {
//             return (aChr as i32) - (bChr as i32);
//         } else if (aChr == 0) {
//             return 0;
//         }
//         i++
//     }
// }

// // scan body starting from offset, and return a string with the next
// // value in the csv document. 
// function csvFindNext(body: utf8String, offset: usize): utf8String {
//     let returnValue: utf8String
//     return returnValue
// }

// export function strip(header: StripHeader): void {
//     let columnCount: i32 = header.columns.length
//     let offset: usize = 0;

//     let body: utf8String = header.body
//     let next: utf8String = csvFindNext(body, offset)

//     for (let index: i32 = 0; index < columnCount; index += 1) {
//         // get the location of the column name start
//         let column: utf8String = header.columns[index]

        
//     }
// }

// class utf8String {
//     // address of the string
//     start: usize
//     // length in bytes
//     length: usize
// }

// class StripHeader {
//     body: utf8String;
//     columns: Array<utf8String>
// }

declare function js$included(offset: usize, length: usize): i32
declare function js$yes(): void
declare function js$no(): void

export function strip2(): void {
    if (js$included(0, 4) != -1) {
        js$yes()
    } else {
        js$no()
    }
}

// we ignore everything except these
const comma: u8 = 44
const quote: u8 = 34
const newline: u8 = 10

export function strip(length: usize): void {
    // bitfield of which columns to keep
    let columnsIncluded: u64 = 0

    // we write the output back into the same buffer and use this offset
    let outOffset: usize = 0

    // if true, we're reading the first line
    let inHeader: bool = true

    // in a quoted value
    let inQuote: bool = false

    // just exited a quoted value
    let endQuote: bool = false

    // if true, include the quotes in the final value
    let quoteValue: bool = false

    // current value is in quotes
    let valueQuoted: bool = false

    // start offset of value we're reading right now
    let valueStart: usize = 0

    // which column we're working on in the current line
    let column: u8 = 0

    // which column as a bit in a bitfield
    let columnBit: u64 = 1

    for (let cur: usize = 0; ; cur++) {
        let char: u8 = load<u8>(cur)
        if (char == quote) {
            if (inQuote) {
                inQuote = false
                endQuote = true
            } else {
                // remember that the value started with a quote
                valueQuoted = cur == valueStart

                // we're in quotes if the value just started with quotes, or we hit 
                // two quotes in a row inside quotes
                inQuote = valueQuoted || endQuote

                // otherwise, just ignore the quote - this might merit an error
                // but let's ignore this quote for now
            }
        } else if (char == comma) {
            endQuote = false
            if (inQuote) {
                quoteValue = true
            } else {
                // current value is over
                let valueEnd: usize = cur

                if (inHeader) {
                    // as we read in the header, check if we keep each column
                    // for now, force the callee to deal with quotes and escaping and the like
                    let keep: bool = js$included(valueStart, valueEnd - valueStart) >= 0
                    columnsIncluded |= columnBit
                }

                if (valueQuoted && !quoteValue) {
                    // we strip quotes if we don't think they're needed
                    valueStart += 1
                    valueEnd -= 1
                }

                if (columnsIncluded & columnBit) {
                    // write this column to the output before continuing
                    while (valueStart < valueEnd) {
                        store<u8>(outOffset++, load<u8>(valueStart++))
                    }

                    store<u8>(outOffset++, comma)

                    // we're in the next column now
                    column++
                    columnBit <<= 1
                }
            }
        } else if (char == newline) {
            endQuote = false
            if (inQuote) {
                quoteValue = true
            } else {
                // current value is over
                let valueEnd: usize = cur

                if (inHeader) {
                    // as we read in the header, check if we keep each column
                    // for now, force the callee to deal with quotes and escaping and the like
                    let keep: bool = js$included(valueStart, valueEnd - valueStart) >= 0
                    columnsIncluded |= columnBit
                    inHeader = false
                }

                if (valueQuoted && !quoteValue) {
                    // we strip quotes if we don't think they're needed
                    valueStart += 1
                    valueEnd -= 1
                }

                if (columnsIncluded & columnBit) {
                    // write this column to the output before continuing
                    while (valueStart < valueEnd) {
                        store<u8>(outOffset++, load<u8>(valueStart++))
                    }

                    store<u8>(outOffset++, comma)

                    // we're in the next column now
                    column++
                    columnBit <<= 1
                }
            }
        } else {
            endQuote = false
        }
    }
}