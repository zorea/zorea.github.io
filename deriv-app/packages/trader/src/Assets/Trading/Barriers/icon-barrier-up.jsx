import PropTypes from 'prop-types';
import React     from 'react';

const IconBarrierUp = ({ className }) => (
    <svg className={className} width='16' height='16'>
        <path
            className='color1-fill'
            fillOpacity='.8'
            fillRule='evenodd'
            d='M8.5 4.207V12.5a.5.5 0 1 1-1 0V4.207L4.854 6.854a.5.5 0 1 1-.708-.708l3.5-3.5a.5.5 0 0 1 .708 0l3.5 3.5a.5.5 0 1 1-.708.708L8.5 4.207z'
        />
    </svg>
);

IconBarrierUp.propTypes = {
    className: PropTypes.string,
};

export default IconBarrierUp;
