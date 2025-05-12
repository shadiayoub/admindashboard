// src/app/api/validators/list/route.ts
export async function GET() {
        const validators = [
        '0x8ca39930cd6a6582a41d2b6abf20b795c85dda59',
        '0x9cd5c72a5cc5ce2bc6b5dc5816ef0aa9030767da',
        '0xb3a72cb21c74d2b15129664cd672036f5806830a',
        '0xe14c41bc174a5820e0707c2df61d36113ed4f260',
        '0xf2ad88540c5c7b85af39c3bb3699787c5da66a6c',
      // ... other validator addresses
    ]
    return Response.json({ validators })
  }
  