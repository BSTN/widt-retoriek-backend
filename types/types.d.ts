import {Model} from 'sequelize'


export interface USERDATA {
  userid: string,
  data: string
}

export interface USERDATATABLE extends Model<Partial<USERDATA>> {
}