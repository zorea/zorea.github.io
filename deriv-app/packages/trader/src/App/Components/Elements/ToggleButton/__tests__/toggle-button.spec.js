import { expect }   from 'chai';
import { shallow }  from 'enzyme';
import React        from 'react';
import { fake }     from 'sinon';
import Button       from 'deriv-components/lib/button';
import ToggleButton from '../toggle-button.jsx';

describe('<ToggleButton />', () => {
    it('should render a <Button /> element', () => {
        const wrapper = shallow(<ToggleButton value='test'>Test</ToggleButton>);
        expect(wrapper.type()).to.equal(Button);
    });

    it('should render a <Button /> element with selected class name', () => {
        const wrapper = shallow(<ToggleButton value='test' is_selected>Test</ToggleButton>);
        expect(wrapper.hasClass('toggle-button--selected')).be.true;
    });

    describe('prop: onClick', () => {
        let event;

        before(() => {
            event = {
                preventDefault    : () => {},
                isDefaultPrevented: () => true,
            };
        });

        it('should be called when the button clicked', () => {
            const callback = fake();
            const wrapper = shallow(<ToggleButton value='test' onClick={callback}>Test</ToggleButton>);
            wrapper.simulate('click', event);
            expect(callback.called).be.true;

        });

        it('should be called with the button value when the button clicked', () => {
            const callback = fake();
            const wrapper = shallow(<ToggleButton value='test' onClick={callback}>Test</ToggleButton>);
            wrapper.simulate('click', event);
            expect(callback.lastArg).to.equal('test');
        });
    });

    describe('prop: onChange', () => {
        let event;
        let defaultPreventd = false;

        before(() => {
            event = {
                preventDefault    : () => { defaultPreventd = true; },
                isDefaultPrevented: () => defaultPreventd,
            };
        });

        it('should be called when the button clicked', () => {
            const callback = fake();
            const wrapper = shallow(<ToggleButton value='test' onChange={callback}>Test</ToggleButton>);
            wrapper.simulate('click', event);
            expect(callback.called).be.true;
        });

        it('should be called with the button value when the button clicked', () => {
            const callback = fake();
            const wrapper = shallow(<ToggleButton value='test' onChange={callback}>Test</ToggleButton>);
            wrapper.simulate('click', event);
            expect(callback.lastArg).to.equal('test');
        });

        it('should not be called when the click is prevented', () => {
            const callback = fake();
            const wrapper = shallow(
                <ToggleButton 
                    value='test'
                    onChange={callback}
                    onClick={(event) => event.preventDefault()}
                >
                    Test
                </ToggleButton>
            );

            wrapper.simulate('click', event);
            expect(callback.callCount).to.equal(0);
        });
    });

});
