import classNames from 'classnames';
import PropTypes  from 'prop-types';
import React      from 'react';

const IconBell = ({ className }) => (
    <svg className={classNames('inline-icon', className)} viewBox='0 0 24 24'>
        <g fill='none' fillRule='nonzero'>
            <path className='color1-fill'  fill='#000' fillOpacity='.8' d='M11 20c0 .552.5 1 1 1s1-.448 1-1h1c0 1.095-.937 2-2 2s-2-.905-2-2z' />
            <path className='color1-stroke' stroke='#000' strokeOpacity='.8' d='M19.936 18.644L18.5 17.207V11a6.493 6.493 0 0 0-5.106-6.341L13 4.573V3c0-.554-.446-1-1-1s-1 .446-1 1v1.573l-.394.086A6.493 6.493 0 0 0 5.5 11v6.207l-1.436 1.437c-.317.316-.096.856.346.856h15.17c.445 0 .67-.542.356-.856z' />
        </g>
    </svg>
);

IconBell.propTypes = {
    className: PropTypes.string,
};

export default IconBell;
