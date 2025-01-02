import { Type } from '@sinclair/typebox';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const LoginSchema = Type.Object({
  username: Type.Union([
    Type.String({ pattern: '^[0-9]+$' }), 
    Type.String({ pattern: '^[a-zA-Z0-9._%+-]+@ish\\.co\\.id$' })
  ]),
  password: Type.String({ minLength: 1 }), 
});

const ajv = new Ajv();
addFormats(ajv); 
ajv.addKeyword('kind').addKeyword('modifier'); 

const validate = ajv.compile(LoginSchema);

export const validateLogin = (data) => {
  const valid = validate(data);
  if (!valid) {
    const errors = validate.errors.map((err) => `${err.instancePath} ${err.message}`).join(', ');
    throw new Error(`Invalid login data: ${errors}`);
  }
};
