import {
    FormControlLabel,
    Switch
}                                 from 'material-ui';
import * as React                 from 'react';
import { TypeElementEditorProps } from './typeEditorProps';

export default ({ prop, record, onDataChange }: TypeElementEditorProps<'boolean'>) => (
    <FormControlLabel
        control={(
            <Switch
                checked={record}
                onChange={(event, checked) => onDataChange(checked)}
            />
        )}
        label={prop.label}
    />
);