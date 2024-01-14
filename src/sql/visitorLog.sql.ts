import mockDayDataModel from '@/model/mockDayData.model';
import mockHourDataModel from '@/model/mockHourData.model';
import mockMinuteTenDataModel from '@/model/mockMinuteTenData.model';
import visitorLogModel from '@/model/visitorLog.model';

export const getAnalysisByDaySql = (data: {
  rangTimeStart: string;
  rangTimeEnd: string;
  orderName: string;
  orderBy: string;
}) => `
SELECT
  COALESCE ( sum( duration ), 0 ) AS sum_duration,
  t3.day AS format_date,
  GROUP_CONCAT( DISTINCT ip SEPARATOR ', ' ) AS unique_ip_str,
	GROUP_CONCAT( DISTINCT user_id SEPARATOR ', ' ) AS unique_user_id_str,
	GROUP_CONCAT( ip SEPARATOR ', ' ) AS ip_str,
	GROUP_CONCAT( user_id SEPARATOR ', ' ) AS user_id_str,
	GROUP_CONCAT( duration SEPARATOR ', ' ) AS duration_str
FROM
	(
	SELECT
		id,
		ip,
		user_id,
		live_room_id,
		duration,
		DATE_FORMAT( ${visitorLogModel.name}.created_at, '%Y-%m-%d 00:00:00' ) AS format_created_at
	FROM
		${visitorLogModel.name} AS ${visitorLogModel.name}
	WHERE
	( ${visitorLogModel.name}.deleted_at IS NULL AND created_at >= '${data.rangTimeStart}' AND created_at <= '${data.rangTimeEnd}')) AS t2
	RIGHT JOIN ${mockDayDataModel.name} AS t3 ON t2.format_created_at = t3.day
WHERE
	t3.day >= '${data.rangTimeStart}'
	AND t3.day <= '${data.rangTimeEnd}'
GROUP BY
	format_date
ORDER BY ${data.orderName} ${data.orderBy}
`;

export const getAnalysisByHourSql = (data: {
  rangTimeStart: string;
  rangTimeEnd: string;
  orderName: string;
  orderBy: string;
}) => `
SELECT
  COALESCE ( sum( duration ), 0 ) AS sum_duration,
  t3.hour AS format_date,
  GROUP_CONCAT( DISTINCT ip SEPARATOR ', ' ) AS unique_ip_str,
	GROUP_CONCAT( DISTINCT user_id SEPARATOR ', ' ) AS unique_user_id_str,
	GROUP_CONCAT( ip SEPARATOR ', ' ) AS ip_str,
	GROUP_CONCAT( user_id SEPARATOR ', ' ) AS user_id_str,
	GROUP_CONCAT( duration SEPARATOR ', ' ) AS duration_str
FROM
	(
	SELECT
		id,
		ip,
		user_id,
		live_room_id,
		duration,
		DATE_FORMAT( ${visitorLogModel.name}.created_at, '%Y-%m-%d %H:00:00' ) AS format_created_at
	FROM
		${visitorLogModel.name} AS ${visitorLogModel.name}
	WHERE
	( ${visitorLogModel.name}.deleted_at IS NULL AND created_at >= '${data.rangTimeStart}' AND created_at <= '${data.rangTimeEnd}')) AS t2
	RIGHT JOIN ${mockHourDataModel.name} AS t3 ON t2.format_created_at = t3.hour
WHERE
	t3.hour >= '${data.rangTimeStart}'
	AND t3.hour <= '${data.rangTimeEnd}'
GROUP BY
	format_date
ORDER BY ${data.orderName} ${data.orderBy}
`;

export const getAnalysisByMinuteTenSql = (data: {
  rangTimeStart: string;
  rangTimeEnd: string;
  orderName: string;
  orderBy: string;
}) => `
SELECT
  COALESCE ( sum( duration ), 0 ) AS sum_duration,
  t3.minute AS format_date,
  GROUP_CONCAT( DISTINCT ip SEPARATOR ', ' ) AS unique_ip_str,
	GROUP_CONCAT( DISTINCT user_id SEPARATOR ', ' ) AS unique_user_id_str,
	GROUP_CONCAT( ip SEPARATOR ', ' ) AS ip_str,
	GROUP_CONCAT( user_id SEPARATOR ', ' ) AS user_id_str,
	GROUP_CONCAT( duration SEPARATOR ', ' ) AS duration_str
FROM
	(
	SELECT
		id,
		ip,
		user_id,
		live_room_id,
		duration,
		DATE_FORMAT( ${visitorLogModel.name}.created_at, '%Y-%m-%d %H:%M:00' ) AS format_created_at
	FROM
		${visitorLogModel.name} AS ${visitorLogModel.name}
	WHERE
	( ${visitorLogModel.name}.deleted_at IS NULL AND created_at >= '${data.rangTimeStart}' AND created_at <= '${data.rangTimeEnd}')) AS t2
	RIGHT JOIN ${mockMinuteTenDataModel.name} AS t3 ON t2.format_created_at = t3.minute
WHERE
	t3.minute >= '${data.rangTimeStart}'
	AND t3.minute <= '${data.rangTimeEnd}'
GROUP BY
	format_date
ORDER BY ${data.orderName} ${data.orderBy}
`;

export const getUserVisitRecordSql = (data: {
  userId: number;
  rangTimeStart: string;
  rangTimeEnd: string;
  orderName?: string;
  orderBy?: string;
}) => {
  let orderStr = '';
  if (data.orderBy && data.orderName) {
    orderStr = `ORDER BY ${data.orderName} ${data.orderBy}`;
  }
  return `
  SELECT
    t3.day AS format_date,
    t4.username,
		t4.is_tourist,
    COUNT( t4.id ) AS user_id_nums,
    COALESCE ( t4.id, ${data.userId} ) AS user_id,
    COALESCE ( GROUP_CONCAT( DISTINCT t7.role_id SEPARATOR ', ' ), '' ) AS user_role_id,
    COALESCE ( GROUP_CONCAT( DISTINCT t8.role_name SEPARATOR ', ' ), '' ) AS user_role_name,
    COALESCE ( GROUP_CONCAT( DISTINCT t5.user_id SEPARATOR ', ' ), '' ) AS parent_user_id,
    COALESCE ( GROUP_CONCAT( DISTINCT t6.username SEPARATOR ', ' ), '' ) AS parent_user_username,
    COALESCE ( sum( duration ), 0 ) AS sum_duration,
    COALESCE ( GROUP_CONCAT( DISTINCT live_room_id SEPARATOR ', ' ), '' ) AS live_room_id_str,
    COALESCE ( GROUP_CONCAT( duration SEPARATOR ', ' ), '' ) AS duration_str
  FROM
    ( SELECT user_id, duration, live_room_id, DATE_FORMAT( created_at, '%Y-%m-%d' ) AS format_date FROM ${visitorLogModel.name} WHERE deleted_at IS NULL AND user_id = ${data.userId} AND created_at >= '${data.rangTimeStart}' AND created_at <= '${data.rangTimeEnd}' ) AS subquery
    RIGHT JOIN ${mockDayDataModel.name} AS t3 ON t3.day = subquery.format_date
    LEFT JOIN user AS t4 ON t4.id = ${data.userId}
    LEFT JOIN user_child AS t5 ON t5.child_user_id = ${data.userId}
    LEFT JOIN user AS t6 ON t6.id = t5.user_id
    LEFT JOIN user_role AS t7 ON t7.user_id = ${data.userId}
    LEFT JOIN role AS t8 ON t8.id = t7.role_id
  WHERE
    t3.day >= '${data.rangTimeStart}'
    AND t3.day <= '${data.rangTimeEnd}'
  GROUP BY
  day
  ${orderStr}
  `;
};

export const getIpVisitRecordSql = (data: {
  ip: string;
  rangTimeStart: string;
  rangTimeEnd: string;
  orderName?: string;
  orderBy?: string;
}) => {
  let orderStr = '';
  if (data.orderBy && data.orderName) {
    orderStr = `ORDER BY ${data.orderName} ${data.orderBy}`;
  }
  return `
  SELECT
    t3.day AS format_date,
    COALESCE ( ip, '${data.ip}' ) AS ip,
    count( ip ) AS ip_nums,
    COALESCE ( sum( duration ), 0 ) AS sum_duration,
    COALESCE ( GROUP_CONCAT( DISTINCT live_room_id SEPARATOR ', ' ), '' ) AS live_room_id_str,
    COALESCE ( GROUP_CONCAT( duration SEPARATOR ', ' ), '' ) AS duration_str
  FROM
    ( SELECT ip, duration, live_room_id, DATE_FORMAT( created_at, '%Y-%m-%d' ) AS format_date FROM ${visitorLogModel.name} WHERE deleted_at IS NULL AND ip = '${data.ip}' AND created_at >= '${data.rangTimeStart}' AND created_at <= '${data.rangTimeEnd}' ) AS subquery
    RIGHT JOIN ${mockDayDataModel.name} AS t3 ON t3.day = subquery.format_date
  WHERE
    t3.day >= '${data.rangTimeStart}'
    AND t3.day <= '${data.rangTimeEnd}'
  GROUP BY
  day
  ${orderStr}
  `;
};
