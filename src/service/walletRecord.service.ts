import { deleteUseLessObjectKey, filterObj } from 'billd-utils';
import { Op } from 'sequelize';

import { IList, IWalletRecord } from '@/interface';
import walletRecordModel from '@/model/walletRecord.model';
import { handlePaging } from '@/utils';

class WalletRecordService {
  /** 钱包记录是否存在 */
  async isExist(ids: number[]) {
    const res = await walletRecordModel.count({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    });
    return res === ids.length;
  }

  /** 获取钱包记录列表 */
  async getList({
    id,
    user_id,
    order_id,
    type,
    name,
    orderBy,
    orderName,
    nowPage,
    pageSize,
    keyWord,
    rangTimeType,
    rangTimeStart,
    rangTimeEnd,
  }: IList<IWalletRecord>) {
    let offset;
    let limit;
    if (nowPage && pageSize) {
      offset = (+nowPage - 1) * +pageSize;
      limit = +pageSize;
    }
    const allWhere: any = deleteUseLessObjectKey({
      id,
      user_id,
      order_id,
      type,
      name,
    });
    if (keyWord) {
      const keyWordWhere = [
        {
          name: {
            [Op.like]: `%${keyWord}%`,
          },
        },
        {
          remark: {
            [Op.like]: `%${keyWord}%`,
          },
        },
      ];
      allWhere[Op.or] = keyWordWhere;
    }
    if (rangTimeType && rangTimeStart && rangTimeEnd) {
      allWhere[rangTimeType] = {
        [Op.gt]: new Date(+rangTimeStart),
        [Op.lt]: new Date(+rangTimeEnd),
      };
    }
    const orderRes: any[] = [];
    if (orderName && orderBy) {
      orderRes.push([orderName, orderBy]);
    }
    const result = await walletRecordModel.findAndCountAll({
      order: [...orderRes],
      limit,
      offset,
      where: {
        ...allWhere,
      },
    });
    return handlePaging(result, nowPage, pageSize);
  }

  /** 查找钱包记录 */
  async find(id: number) {
    const result = await walletRecordModel.findOne({ where: { id } });
    return result;
  }

  /** 修改钱包记录 */
  async update(data: IWalletRecord) {
    const { id } = data;
    const data2 = filterObj(data, ['id']);
    const result = await walletRecordModel.update(data2, {
      where: { id },
      limit: 1,
    });
    return result;
  }

  /** 创建钱包记录 */
  async create(data: IWalletRecord) {
    const result = await walletRecordModel.create(data);
    return result;
  }

  /** 删除钱包记录 */
  async delete(id: number) {
    const result = await walletRecordModel.destroy({
      where: { id },
      limit: 1,
      individualHooks: true,
    });
    return result;
  }
}

export default new WalletRecordService();
