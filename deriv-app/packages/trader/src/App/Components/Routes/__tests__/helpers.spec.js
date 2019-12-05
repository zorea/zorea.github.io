import React           from 'react';
import { expect }      from 'chai';
import * as Helpers    from '../helpers';
import routes          from '../../../../Constants/routes';
import getRoutesConfig from '../../../Constants/routes-config';
import Trade           from 'Modules/Trading';

describe('Helpers', () => {
    describe('normalizePath', () => {
        it('should return / as if path is empty', () => {
            expect(Helpers.normalizePath('')).to.equal('/');
        });
        it('should return / + path as if path does not have /', () => {
            expect(Helpers.normalizePath('trade')).to.equal('/trade');
        });
        it('should return / + path as if path does have /', () => {
            expect(Helpers.normalizePath('/trade')).to.equal('/trade');
        });
    });

    describe('findRouteByPath', () => {
        it('should return undefined when path is not in routes_config', () => {
            expect(Helpers.findRouteByPath('invalidRoute', getRoutesConfig())).to.be.undefined;
        });
        it('should return route_info when path is in routes_config and is not nested', () => {
            expect(Helpers.findRouteByPath(routes.trade, getRoutesConfig())).to.eql({
                path: routes.trade,
                component: Trade,
                title: 'Trade',
                exact: true
            });
        });
        it('should return route_info of parent route when path is in routes_config child level and is nested', () => {
            const reports_routes_length = getRoutesConfig().find(r => r.path === routes.reports).routes.length;
            expect(Helpers.findRouteByPath(routes.profit, getRoutesConfig())).to.have.all.keys('path', 'component', 'is_authenticated', 'routes', 'title');
            expect(Helpers.findRouteByPath(routes.profit, getRoutesConfig()).routes).to.be.instanceof(Array);
            expect(Helpers.findRouteByPath(routes.profit, getRoutesConfig()).routes).to.have.length(reports_routes_length);
            expect(Helpers.findRouteByPath(routes.profit, getRoutesConfig()).is_authenticated).to.be.equal(true);
            expect(Helpers.findRouteByPath(routes.profit, getRoutesConfig()).path).to.be.equal(routes.reports);
        });
    });

    describe('isRouteVisible', () => {
        it('should return true if route needs user to be authenticated and user is logged in', () => {
            expect(Helpers.isRouteVisible({ path: '/contract', is_authenticated: true }, true)).to.equal(true);
        });
        it('should return false if route needs user to be authenticated and user is not logged in', () => {
            expect(Helpers.isRouteVisible({ path: '/contract', is_authenticated: true }, false)).to.equal(false);
        });
        it('should return true if route does not need user to be authenticated and user is not logged in', () => {
            expect(Helpers.isRouteVisible({ path: '/contract', is_authenticated: false }, false)).to.equal(true);
        });
        it('should return true if route does not need user to be authenticated and user is logged in', () => {
            expect(Helpers.isRouteVisible({ path: '/contract', is_authenticated: false }, true)).to.equal(true);
        });
    });

    describe('getPath', () => {
        it('should return param values in params as a part of path', () => {
            expect(Helpers.getPath('/contract/:contract_id', { contract_id: 37511105068 })).to.equal('/contract/37511105068');
            expect(Helpers.getPath('/something_made_up/:something_made_up_param1/:something_made_up_param2', { something_made_up_param1: '789', something_made_up_param2: '123456' })).to.equal('/something_made_up/789/123456');
        });
        it('should return path as before if there is no params', () => {
            expect(Helpers.getPath('/contract')).to.equal('/contract');
        });
    });

    describe('getContractPath', () => {
        it('should return the path of contract with contract_id passed', () => {
            expect(Helpers.getContractPath(1234)).to.equal('/contract/1234');
        });
    });
});
