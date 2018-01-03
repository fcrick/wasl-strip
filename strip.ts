const enum Token {
    ZERO = 0x00
}

namespace js {
    export declare function included(start: usize, end: usize): i32
    export declare function done(outOffset: usize): void
}

// we ignore everything except these
const comma: u8 = 44
const quote: u8 = 34
const newline: u8 = 10

// bitfield of which columns to keep
let columnsIncluded: u64 = 0


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

// we skip writing the first comma in each row
let commaSkipped: bool = false

// which column as a bit in a bitfield
let columnBit: u64 = 1

// which row we're on
let row: usize = 0

// start offset of value we're reading right now
let valueStart: usize = 0

// end offset of value we're reading right now
let valueEnd: usize = 0

// we write the output back into the same buffer and use this offset
let outOffset: usize = 0

// which column we're working on in the current line
let column: u8 = 0

function checkIncluded(): void {
    if (inHeader) {
        // as we read in the header, check if we keep each column
        // for now, force the callee to deal with quotes and escaping and the like
        let included: i32 = js.included(valueStart, valueEnd)
        if (included >= 0) {
            columnsIncluded |= columnBit
        }
    }
}

function stripQuotes(): void {
    if (valueQuoted && !quoteValue) {
        // we strip quotes if we don't think they're needed
        valueStart += 1
        valueEnd -= 1
    }
}

function writeValue(): void {
    if ((columnsIncluded & columnBit) > 0) {
        // write out the character before the value, if any
        if (commaSkipped) {
            store<u8>(outOffset, comma)
            outOffset += 1
        } else {
            if (row != 0) {
                store<u8>(outOffset, newline)
                outOffset += 1
            }
            commaSkipped = true
        }

        // write this column to the output before continuing
        while (valueStart < valueEnd) {
            store<u8>(outOffset, load<u8>(valueStart))
            outOffset += 1
            valueStart += 1
        }
    }
}

function onEndValue(position: usize): void {
    valueEnd = position
    checkIncluded()
    stripQuotes()
    writeValue()
    valueStart = position + 1
    quoteValue = false
    valueQuoted = false
}

export function strip(length: usize): void {
    

    for (let cur: usize = 0; cur < length; cur++) {
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
        } else {
            endQuote = false
            if (char == comma || char == newline) {
                if (inQuote) {
                    quoteValue = true
                } else {
                    // current value is over
                    onEndValue(cur)

                    if (char == comma) {
                        // we're in the next column now
                        column += 1
                        columnBit <<= 1
                    } else { // if (char == newline)
                        // start back at the first column
                        inHeader = false
                        column = 0
                        columnBit = 1
                        row += 1
                        commaSkipped = false
                    }
                }
            }
        }
    }

    onEndValue(length)

    js.done(outOffset)
}