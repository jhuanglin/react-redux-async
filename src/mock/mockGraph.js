const momentRandom = require('moment-random')

/**
 *
 * @param {Number} maxNode
 */
function mockGraphData(maxNode) {
  const postfix = Date.now()
  let centerNode = {_key: '1', _id: `Company/center`, name: '中心点', _textType: 0, uiConfig:{}, expandFroms: '', isCenter: true, _tag: 'START', schemaInfo: {schemaName: 'center', schemaNameCn: '中心点'}}

  let graphData = {
    vertexes: [centerNode],
    edges: []
  }

  for (let i=0;i<maxNode;i++) {
    let pid = `Company/center`
    let curId = `Company/${i}${postfix}`

    const startDate = '2010-06-27'
    const endDate = '2019-06-27'
    graphData.vertexes.push({
      _key: `${i}${postfix}`,
      _id: `Company/${i}${postfix}`,
      name: `实体${i}-vertex`,
      uiConfig:{},
      expandFroms: '',
      timelineField: 'regDate',
      regDate: momentRandom(endDate, startDate)
    })
    graphData.edges.push({
      _from: `Company/center`,
      _to: `Company/${i}${postfix}`,
      _id: `testLabel/${i}${postfix}`,
      label: `测试边${i}`,
      uiConfig:{},
      expandFroms: '',
      timelineField: 'investDate',
      investDate: momentRandom(endDate, startDate)
    })

    let randomNumber = getRandom(1, 10)

    while(randomNumber > 1) {
      i++
      if (i > maxNode) {
        break
      }
      if (randomNumber === 10) {
        pid = curId
        curId = `Company/${i}${postfix}`
      } else {
        pid = `Company/${getRandom(0,i)}${postfix}`
      }

      if (randomNumber<10 && randomNumber > 5) {
        graphData.edges.push({ _from: `Company/${getRandom(0,i)}${postfix}`, _to: `Company/${getRandom(0,i)}${postfix}`, _id: `testLabel/${i}00${postfix}`, label: `测试边${i}00`, uiConfig:{}, expandFroms: '', schemaInfo: {schemaName: 'edge', schemaNameCn: '边'} })
      }

      graphData.vertexes.push({
        _key: `${i}${postfix}`,
        _id: `Company/${i}${postfix}`,
        name: `实体${i}${postfix}`,
        uiConfig:{},
        expandFroms: '',
        timelineField: 'regDate',
        regDate: momentRandom(endDate, startDate),
        schemaInfo: {schemaName: 'edge', schemaNameCn: '边'}
      })
      graphData.edges.push({
        _from: pid,
        _to: `Company/${i}${postfix}`,
        _id: `testLabel/${i}${postfix}`,
        label: `测试边${i}${postfix}`,
        uiConfig:{},
        expandFroms: '',
        timelineField: 'investDate',
        investDate: momentRandom(endDate, startDate),
        schemaInfo: {schemaName: 'edge', schemaNameCn: '边'}
      })
      randomNumber = getRandom(1, 10)
    }
  }
  return graphData
}
function getRandom(min, max) {
  return  parseInt(Math.random()*(max-min+1)+min,10);
}

module.exports = {
  mockGraphData
}









/* edge 边
{
  "_key": "1750F08548EF68A130FD9B281DD2485E",
  "_id": "invest/1750F08548EF68A130FD9B281DD2485E",
  "_from": "Company/E0F11F4AC38600EF6DDA2B49671523F2",
  "_to": "Company/0EF3AB620B8532748F4D8C01E862A329",
  "_rev": "_YgVlSdK--A",
  "_record_id": "89f2a151301fd983fab695e309dd8d8e",
  "ctime": "2019-04-16 01:02:25",
  "invest_amount": "4000000.00",
  "invest_amount_unit": "元",
  "paied_amount": "0.00",
  "paied_amount_unit": "元",
  "shareholder_type": "企业法人",
  "utime": "2019-04-16 01:02:25",
  "label": "投资（400.00万元）,占比11.43%"
}
*/
/* vertexes 实体
{
  "_key": "0EF3AB620B8532748F4D8C01E862A329",
  "_id": "Company/0EF3AB620B8532748F4D8C01E862A329",
  "_rev": "_YgU2TjS--_",
  "address": "北京市海淀区学院路甲5号2幢平房B-1031室",
  "business_status": "开业",
  "capital": "35000000.00",
  "city": "北京",
  "ctime": "2019-04-16 01:02:25",
  "enterprise_type": "其他有限责任公司",
  "industry": "科技推广和应用服务业",
  "is_listed": "false",
  "name": "北京海致星图科技有限公司",
  "operation_startdate": "2015-08-25",
  "province": "北京",
  "registered_address": "北京市工商行政管理局海淀分局",
  "registered_capital_unit": "元",
  "utime": "2019-04-16 01:02:25",
  "_type": "Company",
  "type": "",
  "getPathTypes": 0
}
 */
