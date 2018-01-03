(module
 (type $iii (func (param i32 i32) (result i32)))
 (type $v (func))
 (type $iv (func (param i32)))
 (import "js" "included" (func $strip/js.included (param i32 i32) (result i32)))
 (import "js" "done" (func $strip/js.done (param i32)))
 (global $strip/inQuote (mut i32) (i32.const 0))
 (global $strip/endQuote (mut i32) (i32.const 0))
 (global $strip/valueQuoted (mut i32) (i32.const 0))
 (global $strip/valueStart (mut i32) (i32.const 0))
 (global $strip/quoteValue (mut i32) (i32.const 0))
 (global $strip/valueEnd (mut i32) (i32.const 0))
 (global $strip/inHeader (mut i32) (i32.const 1))
 (global $strip/columnsIncluded (mut i64) (i64.const 0))
 (global $strip/columnBit (mut i64) (i64.const 1))
 (global $strip/commaSkipped (mut i32) (i32.const 0))
 (global $strip/outOffset (mut i32) (i32.const 0))
 (global $strip/row (mut i32) (i32.const 0))
 (global $strip/column (mut i32) (i32.const 0))
 (memory $0 1)
 (export "strip" (func $strip/strip))
 (export "memory" (memory $0))
 (func $strip/checkIncluded (; 2 ;) (type $v)
  (if
   (get_global $strip/inHeader)
   (if
    (i32.ge_s
     (call $strip/js.included
      (get_global $strip/valueStart)
      (get_global $strip/valueEnd)
     )
     (i32.const 0)
    )
    (set_global $strip/columnsIncluded
     (i64.or
      (get_global $strip/columnsIncluded)
      (get_global $strip/columnBit)
     )
    )
   )
  )
 )
 (func $strip/stripQuotes (; 3 ;) (type $v)
  (if
   (if (result i32)
    (get_global $strip/valueQuoted)
    (i32.eqz
     (get_global $strip/quoteValue)
    )
    (get_global $strip/valueQuoted)
   )
   (block
    (set_global $strip/valueStart
     (i32.add
      (get_global $strip/valueStart)
      (i32.const 1)
     )
    )
    (set_global $strip/valueEnd
     (i32.sub
      (get_global $strip/valueEnd)
      (i32.const 1)
     )
    )
   )
  )
 )
 (func $strip/writeValue (; 4 ;) (type $v)
  (if
   (i64.gt_u
    (i64.and
     (get_global $strip/columnsIncluded)
     (get_global $strip/columnBit)
    )
    (i64.const 0)
   )
   (block
    (if
     (get_global $strip/commaSkipped)
     (block
      (i32.store8
       (get_global $strip/outOffset)
       (i32.const 44)
      )
      (set_global $strip/outOffset
       (i32.add
        (get_global $strip/outOffset)
        (i32.const 1)
       )
      )
     )
     (block
      (if
       (get_global $strip/row)
       (block
        (i32.store8
         (get_global $strip/outOffset)
         (i32.const 10)
        )
        (set_global $strip/outOffset
         (i32.add
          (get_global $strip/outOffset)
          (i32.const 1)
         )
        )
       )
      )
      (set_global $strip/commaSkipped
       (i32.const 1)
      )
     )
    )
    (loop $continue|0
     (if
      (i32.lt_u
       (get_global $strip/valueStart)
       (get_global $strip/valueEnd)
      )
      (block
       (i32.store8
        (get_global $strip/outOffset)
        (i32.load8_u
         (get_global $strip/valueStart)
        )
       )
       (set_global $strip/outOffset
        (i32.add
         (get_global $strip/outOffset)
         (i32.const 1)
        )
       )
       (set_global $strip/valueStart
        (i32.add
         (get_global $strip/valueStart)
         (i32.const 1)
        )
       )
       (br $continue|0)
      )
     )
    )
   )
  )
 )
 (func $strip/onEndValue (; 5 ;) (type $iv) (param $0 i32)
  (set_global $strip/valueEnd
   (get_local $0)
  )
  (call $strip/checkIncluded)
  (call $strip/stripQuotes)
  (call $strip/writeValue)
  (set_global $strip/valueStart
   (i32.add
    (get_local $0)
    (i32.const 1)
   )
  )
  (set_global $strip/quoteValue
   (i32.const 0)
  )
  (set_global $strip/valueQuoted
   (i32.const 0)
  )
 )
 (func $strip/strip (; 6 ;) (type $iv) (param $0 i32)
  (local $1 i32)
  (local $2 i32)
  (set_local $1
   (i32.const 0)
  )
  (loop $continue|0
   (if
    (i32.lt_u
     (get_local $1)
     (get_local $0)
    )
    (block
     (if
      (i32.eq
       (tee_local $2
        (i32.load8_u
         (get_local $1)
        )
       )
       (i32.const 34)
      )
      (if
       (get_global $strip/inQuote)
       (block
        (set_global $strip/inQuote
         (i32.const 0)
        )
        (set_global $strip/endQuote
         (i32.const 1)
        )
       )
       (block
        (set_global $strip/valueQuoted
         (i32.eq
          (get_local $1)
          (get_global $strip/valueStart)
         )
        )
        (set_global $strip/inQuote
         (if (result i32)
          (get_global $strip/valueQuoted)
          (get_global $strip/valueQuoted)
          (get_global $strip/endQuote)
         )
        )
       )
      )
      (block
       (set_global $strip/endQuote
        (i32.const 0)
       )
       (if
        (if (result i32)
         (i32.eq
          (get_local $2)
          (i32.const 44)
         )
         (i32.eq
          (get_local $2)
          (i32.const 44)
         )
         (i32.eq
          (get_local $2)
          (i32.const 10)
         )
        )
        (if
         (get_global $strip/inQuote)
         (set_global $strip/quoteValue
          (i32.const 1)
         )
         (block
          (call $strip/onEndValue
           (get_local $1)
          )
          (if
           (i32.eq
            (get_local $2)
            (i32.const 44)
           )
           (block
            (set_global $strip/column
             (i32.add
              (get_global $strip/column)
              (i32.const 1)
             )
            )
            (set_global $strip/columnBit
             (i64.shl
              (get_global $strip/columnBit)
              (i64.const 1)
             )
            )
           )
           (block
            (set_global $strip/inHeader
             (i32.const 0)
            )
            (set_global $strip/column
             (i32.const 0)
            )
            (set_global $strip/columnBit
             (i64.const 1)
            )
            (set_global $strip/row
             (i32.add
              (get_global $strip/row)
              (i32.const 1)
             )
            )
            (set_global $strip/commaSkipped
             (i32.const 0)
            )
           )
          )
         )
        )
       )
      )
     )
     (set_local $1
      (i32.add
       (get_local $1)
       (i32.const 1)
      )
     )
     (br $continue|0)
    )
   )
  )
  (call $strip/onEndValue
   (get_local $0)
  )
  (call $strip/js.done
   (get_global $strip/outOffset)
  )
 )
)
