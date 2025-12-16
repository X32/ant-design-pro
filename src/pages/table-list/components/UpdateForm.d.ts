import React from 'react';
export type FormValueType = {
    target?: string;
    template?: string;
    type?: string;
    time?: string;
    frequency?: string;
} & Partial<API.RuleListItem>;
export type UpdateFormProps = {
    trigger?: React.ReactElement<any>;
    onOk?: () => void;
    values: Partial<API.RuleListItem>;
};
declare const UpdateForm: React.FC<UpdateFormProps>;
export default UpdateForm;
