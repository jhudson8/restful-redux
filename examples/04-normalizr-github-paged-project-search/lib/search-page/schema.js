import { schema } from 'normalizr';

// we aren't worrying about a complex schema... just demonstrating the ability to normalize based on a schema
const RepositorySchema = new schema.Entity('repository');
export default new schema.Array(RepositorySchema);
