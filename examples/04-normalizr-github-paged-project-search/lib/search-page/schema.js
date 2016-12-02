import { Schema, arrayOf } from 'normalizr';

// we aren't worrying about a complex schema... just demonstrating the ability to normalize based on a schema
export default arrayOf(new Schema('repository'));
