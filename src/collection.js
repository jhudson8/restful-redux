import Model from './model';

export default class Collection extends Model {

  result () {
    if (!this._formatted) {
      this._formatted = true;
      const options = this.options;
      const formatter = options.formatter;
      this._formattedData = formatter
        ? formatter(options)
        : deepValue(this.entities, [this.domain, this.id]);
    }
    return this._formattedData;
  }
}
