import ContractType from '../Helpers/contract-type';

export const onChangeContractTypeList = ({ contract_types_list, contract_type }) => (
    ContractType.getContractType(contract_types_list, contract_type)
);

export const onChangeContractType = (store) => (
    ContractType.getContractValues(store)
);
