import classNames from 'classnames';
import PropTypes  from 'prop-types';
import React      from 'react';

const IconDuplicate = ({ className }) => (
    <svg
        className={classNames('inline-icon', className)}
        xmlns='http://www.w3.org/2000/svg'
        width='115'
        height='115'
        viewBox='0 0 115 115'
    >
        <g fill='none' fillRule='evenodd' transform='translate(-13 -11)'>
            <rect width='102' height='102' x='13' y='11' fill='#E0F0F0' fillRule='nonzero' rx='10' />
            <ellipse cx='63.83' cy='45.76' fill='#FFF' fillRule='nonzero' rx='24.85' ry='24.87' />
            <ellipse cx='63.91' cy='36.71' fill='#84ABAE' fillRule='nonzero' rx='9.43' ry='9.44' />
            <path
                fill='#84ABAE'
                fillRule='nonzero'
                d='M56.32 46.54s2.07 2.69 7.59 2.69 7.3-2.69 7.3-2.69 8.45 3.25 8.45 12.12c0 0-4.38 6.45-15.52 6.45s-16.22-6.45-16.22-6.45.32-9.56 8.4-12.12z'
            />
            <circle cx='105' cy='103' r='23' fill='#FF444F' fillRule='nonzero' />
            <path
                fill='#FFF'
                fillRule='nonzero'
                d='M102.68 111.58V111c0-1.11.68-2 2.32-2 1.64 0 2.32.86 2.32 2v.63c0 1.12-.68 2-2.32 2-1.64 0-2.32-.93-2.32-2.05zm1.54-6.66L103 97.53v-5a2.42 2.42 0 0 1 4.06 0v5l-1.2 7.39a.87.87 0 0 1-1.64 0z'
            />
            <rect width='44' height='6' x='34' y='90.5' fill='#C6E4E4' fillRule='nonzero' rx='3' />
            <rect width='50' height='6' x='34' y='78' fill='#C6E4E4' fillRule='nonzero' rx='3' />
            <path d='M0 0h128v128H0z' />
        </g>
    </svg>

);

IconDuplicate.propTypes = {
    className: PropTypes.string,
};

export default IconDuplicate;
