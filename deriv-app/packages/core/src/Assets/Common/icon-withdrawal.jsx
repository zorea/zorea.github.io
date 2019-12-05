import React from 'react';

const IconWithdrawal = ({ className }) => (
    <svg className={className} width='32' height='32' viewBox='0 0 32 32'>
        <g fill='none'><rect width='32' height='18' fill='#C7E5E5' rx='2' />
            <rect width='24' height='8' x='4' y='5' fill='#2A2A2A' rx='2' />
            <path fill='#85ACB0' d='M7 8h18v22a2 2 0 01-2 2H9a2 2 0 01-2-2V8z' />
            <path fill='#FFF' d='M22.5 8v15.5c-2.667 1.333-3.667 3.333-3 6h-7c.667-2.667-.333-4.667-3-6V8h13z' />
            <path fill='#FF444F' d='M11.893 15.804a.5.5 0 01.41-.492l.09-.008h.487a2.301 2.301 0 012.248-1.803.5.5 0 110 1 1.303 1.303 0 00-.394 2.546l.125.032 2.105-3.578h.286c1.1 0 2.02.772 2.249 1.804h.369a.5.5 0 010 1h-.37a2.304 2.304 0 01-2.248 1.802.5.5 0 110-1 1.303 1.303 0 00.394-2.545l-.125-.033-2.105 3.578h-.286c-1.1 0-2.021-.772-2.25-1.804l-.017.001h-.468a.5.5 0 01-.5-.5z' />
        </g>
    </svg>
);

export default IconWithdrawal;
