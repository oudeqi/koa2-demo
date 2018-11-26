# MongoDB 服务
1. 以管理员身份运行cmd
2. 启动服务: `net start MongoDB` 
3. 关闭服务: `net stop MongoDB`
4. 移除服务: `sc.exe delete MongoDB`

# MongoDB帮助 
`db.help()`  
获取命令列表，这将列出一个命令列表。

# MongoDB统计
`db.stats()`  
获取有关MongoDB服务器的统计信息，这个命令将显示数据库名称，数据库中的集合和文档数量。

# 创建数据库
`use DATABASE_NAME`  
如果指定的数据库DATABASE_NAME不存在，则该命令将创建一个新的数据库，否则返回现有的数据库
``` bash

// 检查当前选择的数据库
>db 
test
// 在 MongoDB 中默认数据库是：test。 如果还没有创建过任何数据库，则集合/文档将存储在test数据库中。

----------------------------------------
>use newdb // 新建或者切换到 newdb 数据库
switched to db newdb
>db
newdb

----------------------------------------
// 检查数据库列表
>show dbs 
local     0.000025GB
test      0.00002GB
// 创建的数据库(newdb)不在列表中。要显示数据库，需要至少插入一个文档，空的数据库是不显示出来的
>db.items.insert({"name":"yiibai tutorials"})
>show dbs
local     0.00005GB
test      0.00002GB
newdb      0.00002GB
```

# 删除现有的数据库
`db.dropDatabase()`   
// 将删除当前所选数据库。如果没有选择任何数据库，那么会删除默认的test数据库  
``` bash
>show dbs
local      0.00025GB
newdb       0.0002GB
test       0.00012GB

>use newdb
switched to db newdb
>db.dropDatabase()
>{ "dropped" : "newdb", "ok" : 1 }
>

>show dbs
local      0.00025GB
test       0.0002GB
```

# 创建集合
`db.createCollection(name, options)`  
``` bash
name	// String	要创建的集合的名称
options	// Document	(可选)指定有关内存大小和索引的选项
------------------------------------
options.capped 
// Boolean	(可选)如果为true，则启用封闭的集合。上限集合是固定大小的集合，它在达到其最大大小时自动覆盖其最旧的条目。 如果指定true，则还需要指定size参数。

options.autoIndexId 
// Boolean (可选)如果为true，则在_id字段上自动创建索引。默认值为false。

options.size 
// 数字	(可选)指定上限集合的最大大小(以字节为单位)。 如果capped为true，那么还需要指定此字段的值。

options.max 
// 数字	(可选)指定上限集合中允许的最大文档数。
```

在 MongoDB 中，不需要创建集合。当插入一些文档时，MongoDB 会自动创建集合。
``` bash
>db.newcollection.insert({"name" : "yiibaitutorials"})
>show collections
mycol
newcollection
mycollection
```

# 删除集合
`db.COLLECTION_NAME.drop()`  
如果选定的集合成功删除，drop()方法将返回true，否则返回false

# MongoDB支持的数据类型
* 字符串 - 这是用于存储数据的最常用的数据类型。MongoDB中的字符串必须为UTF-8。
* 整型 - 此类型用于存储数值。 整数可以是32位或64位，具体取决于服务器。
* 布尔类型 - 此类型用于存储布尔值(true / false)值。
* 双精度浮点数 - 此类型用于存储浮点值。
* 最小/最大键 - 此类型用于将值与最小和最大BSON元素进行比较。
* 数组 - 此类型用于将数组或列表或多个值存储到一个键中。
* 时间戳 - ctimestamp，当文档被修改或添加时，可以方便地进行录制。
* 对象 - 此数据类型用于嵌入式文档。
* Null - 此类型用于存储Null值。
* 符号 - 该数据类型与字符串相同; 但是，通常保留用于使用特定符号类型的语言。
* 日期 - 此数据类型用于以UNIX时间格式存储当前日期或时间。您可以通过创建日期对象并将日，月，年的日期进行指定自己需要的日期时间。
* 对象ID - 此数据类型用于存储文档的ID。
* 二进制数据 - 此数据类型用于存储二进制数据。
* 代码 - 此数据类型用于将JavaScript代码存储到文档中。
* 正则表达式 - 此数据类型用于存储正则表达式。

# 将文档插入集合中
`db.COLLECTION_NAME.insert(document)`  
``` bash
// 这里mycol是集合的名称。
// 如果数据库中不存在集合，则MongoDB将创建此集合，然后将文档插入到该集合中。
db.mycol.insert({
   _id: 100,
   title: 'MongoDB Overview', 
   description: 'MongoDB is no sql database',
   by: 'yiibai tutorials',
   url: 'http://www.yiibai.com',
   tags: ['mongodb', 'database', 'NoSQL'],
   likes: 100,
})

// 文档中，如果不指定_id参数，那么 MongoDB 会为此文档分配一个唯一的ObjectId。
// _id为集合中的每个文档唯一的12个字节的十六进制数。 12字节划分如下
_id: ObjectId(4 bytes timestamp, 3 bytes machine id, 2 bytes process id, 3 bytes incrementer)

// 要在单个查询中插入多个文档，可以在insert()命令中传递文档数组。
// 要插入文档，也可以使用db.post.save(document)
> db.mycol.insert([
   {
    _id: 101,
    title: 'MongoDB Guide', 
    description: 'MongoDB is no sql database',
    by: 'yiibai tutorials',
    url: 'http://www.yiibai.com',
    tags: ['mongodb', 'database', 'NoSQL'],
    likes: 100
   }
])

// db.collection.insertOne()方法
// 返回包含新插入的文档的_id字段值的文档
db.inventory.insertOne(
   { item: "canvas", qty: 100, tags: ["cotton"], size: { h: 28, w: 35.5, uom: "cm" } }
)
{
  "acknowledged" : true,
  "insertedId" : ObjectId("5955220846be576f199feb55")
}

// db.collection.insertMany()方法将多个文档插入到集合中
// insertMany()返回包含新插入的文档_id字段值的文档
db.inventory.insertMany([
   { item: "journal", qty: 25, tags: ["blank", "red"], size: { h: 14, w: 21, uom: "cm" } },
   { item: "mat", qty: 85, tags: ["gray"], size: { h: 27.9, w: 35.5, uom: "cm" } },
   { item: "mousepad", qty: 25, tags: ["gel", "blue"], size: { h: 19, w: 22.85, uom: "cm" } }
])
{
  "acknowledged" : true,
  "insertedIds" : [
    ObjectId("59552c1c46be576f199feb56"),
    ObjectId("59552c1c46be576f199feb57"),
    ObjectId("59552c1c46be576f199feb58")
  ]
}
```

# 文档查询
`db.COLLECTION_NAME.find(document).pretty()`  
`db.COLLECTION_NAME.findOne(document).pretty()`  
find()方法将以非结构化的方式显示所有文档。  
findOne()方法，它只返回一个文档
pretty()以格式化的方式显示结果  

``` bash

// 条件查询
db.mycol.find({"by":"yiibai"}).pretty() // 相等
db.mycol.find({"likes":{$lt:50}}).pretty() // 小于
db.mycol.find({"likes":{$lte:50}}).pretty() // 小于等于
db.mycol.find({"likes":{$gt:50}}).pretty() // 大于
db.mycol.find({"likes":{$gte:50}}).pretty() // 大于等于
db.mycol.find({"likes":{$ne:50}}).pretty() // 不等于

// AND操作符
db.mycol.find({$and:[{"name":"张三"}, {"age": 12}]}).pretty()

// OR操作符
db.mycol.find({$or:[{"name":"张三"}, {"age": "12"}]}).pretty()

// AND 和 OR一起
db.mycol.find({"likes": {$gt:10}, $or: [{"by": "张三"}, {"title": "xzc"}]}).pretty()

// 查询嵌套文档
db.inventory.find({ size: { h: 14, w: 21, uom: "cm" }})
// 例如，选择字段size等于{ h: 14, w: 21, uom: "cm" } 的所有文档
// 整个嵌入式文档中的相等匹配需要精确匹配指定的<value>文档，包括字段顺序。

// 查询嵌套字段
// 要在嵌套文档中的字段上指定查询条件，请使用点符号 "field.nestedField"。在嵌套字段上指定等于匹配
db.inventory.find( { "size.uom": "in" } )

// 使用查询运算符指定匹配
db.inventory.find({"size.h": { $lt: 15 }})

// 指定AND条件
db.inventory.find({"size.h": { $lt: 15 }, "size.uom": "in", status: "D"})
```

# 更新文档
`db.COLLECTION_NAME.update(SELECTION_CRITERIA, UPDATED_DATA)`  
``` bash
// MongoDB 默认只更新一个文档
db.mycol.update({'title':'text'}, {$set:{'title':'Update text'}})
// 要更新多个文档
db.mycol.update({'title':'text'}, {$set:{'title':'Update text'}}, {multi:true})
```

`db.COLLECTION_NAME.save({_id:ObjectId(), NEW_DATA})`
``` bash
// 将_id为 100 的文档使用新的文档替换
db.mycol.save({"_id" : 100, "title":"Update By Save()", "by":"yiibai.com"})
```

# 删除文档
`db.COLLECTION_NAME.remove(criteria, justOne)`
criteria - (可选)符合删除条件的集合将被删除。   
justOne - (可选)如果设置为true或1，则只删除一个文档。
``` bash

// 删除_id为“100”的文档。
db.mycol.remove({'_id':100})

// 只想删除匹配的第一条记录
db.mycol.remove({'_id':100}, 1)

// 删除所有文档记录，不指定删除条件
db.mycol.remove()
```

# 投影(选择字段)
`db.mycol.find({}, {KEY:1})`  
执行find()方法时，它默认将显示文档的所有字段。  
为了限制显示的字段，需要将字段列表对应的值设置为1或0。  
1用于显示字段，而0用于隐藏字段
``` bash
// 查询文档时只显示文档的标题
// 在执行find()方法时，始终都会显示_id字段，如果不想要此字段，则需要将其设置为0
db.mycol.find({}, {'title':1, '_id':0})
```

# 限制返回的记录数
`db.COLLECTION_NAME.find().limit(NUMBER)`  
limit()方法，设置要显示的文档数。如果没有指定参数，那么它将显示集合中的所有文档  
`db.COLLECTION_NAME.find().limit(NUMBER).skip(NUMBER)`   
skip()方法，用于跳过文档数量，默认值为0
``` bash
// 在查询文档时仅显示两个文档
db.mycol.find({}, {"title":1, _id:0}).limit(2)
// 仅显示第三个文档
db.mycol.find({}, {"title":1, _id:0}).limit(1).skip(2)
```

# 排序文档
`db.COLLECTION_NAME.find().sort({KEY:1})`  
1用于升序，而-1用于降序
``` bash
// 按_id降序排序
db.mycol.find({}, {"title": 1, _id: 1}).sort({"_id": -1})
```

# 索引
`db.COLLECTION_NAME.ensureIndex({KEY:1})`   
key是要在其上创建索引的字段的名称，1是升序。   
要按降序创建索引，需要使用-1
1. 索引提高查询的效率。  
2. 没有索引，MongoDB必须扫描集合的每个文档，以选择与查询语句匹配的文档。这种扫描效率很低，需要 MongoDB 处理大量的数据。  
3. 索引是特殊的数据结构，以易于遍历的形式存储数据集的一小部分。索引存储特定字段或一组字段的值，按照索引中指定的字段值排序。  

``` bash
// 可以传递多个字段，以在多个字段上创建索引
db.mycol.ensureIndex({"title":1, "description":-1})
```
ensureIndex()方法也接受选项列表(可选)。
* background // Boolean	在后台构建索引，以便构建索引不会阻止其他数据库活动，则指定background的值为true。默认值为false。
* unique // Boolean	创建一个唯一的索引，使得集合不会接受索引键或键匹配索引中现有值的文档的插入。 指定true以创建唯一索引。 默认值为false。
* name // String	索引的名称。如果未指定，则MongoDB通过连接索引字段的名称和排序顺序来生成索引名称。
* dropDups // Boolean	在可能有重复项的字段上创建唯一索引。MongoDB仅索引第一次出现的键，并从集合中删除包含该键的后续出现的所有文档。指定true以创建唯一索引。 默认值为false。
* sparse // Boolean	如果为true，则索引仅引用具有指定字段的文档。这些索引在某些情况下(特别是排序)使用的空间较小，但行为不同。默认值为false。
* expireAfterSeconds // integer	指定一个值(以秒为单位)作为TTL，以控制MongoDB在此集合中保留文档的时间。
* v // 索引版本	索引版本号。默认索引版本取决于创建索引时运行的MongoDB的版本。
* weights // 文档	权重是从1到99999之间的数字，并且表示该字段相对于其他索引字段在分数方面的意义。
* default_language // String	对于文本索引，确定停止词列表的语言以及句柄和分词器的规则。 默认值为英文。
* language_override // String	对于文本索引，要指定文档中包含覆盖默认语言的字段名称。默认值为language。

# 聚合操作
`db.COLLECTION_NAME.aggregate(AGGREGATE_OPERATION)`

1. 聚合操作处理数据记录并返回计算结果。 
2. 聚合操作将多个文档中的值组合在一起，并可对分组数据执行各种操作，以返回单个结果。 
3. 在SQL中的 count(*)与group by组合相当于mongodb 中的聚合功能。

``` bash
// 模拟数据
db.article.insert([
  {
    _id: 100,
    title: 'MongoDB Overview',
    description: 'MongoDB is no sql database',
    by_user: 'Maxsu',
    url: 'http://www.yiibai.com',
    tags: ['mongodb', 'database', 'NoSQL'],
    likes: 100
  },
  {
    _id: 101,
    title: 'NoSQL Overview', 
    description: 'No sql database is very fast',
    by_user: 'Maxsu',
    url: 'http://www.yiibai.com',
    tags: ['mongodb', 'database', 'NoSQL'],
    likes: 10
  }
])

// 显示一个列表，说明每个用户写入了多少个教程
db.article.aggregate([
  {
    $group : {
      _id : "$by_user", 
      num_tutorial : {$sum : 1}
    }
  }
])

// 可用聚合表达式
$sum	
从集合中的所有文档中求出定义的值。
db.mycol.aggregate([{$group : {_id : "$by_user", num_tutorial : {$sum : "$likes"}}}])

$avg	
计算集合中所有文档的所有给定值的平均值。
db.mycol.aggregate([{$group : {_id : "$by_user", num_tutorial : {$avg : "$likes"}}}])

$min	
从集合中的所有文档获取相应值的最小值。	
db.mycol.aggregate([{$group : {_id : "$by_user", num_tutorial : {$min : "$likes"}}}])

$max	
从集合中的所有文档获取相应值的最大值。	
db.mycol.aggregate([{$group : {_id : "$by_user", num_tutorial : {$max : "$likes"}}}])

$push	
将值插入到生成的文档中的数组中。	
db.mycol.aggregate([{$group : {_id : "$by_user", url : {$push: "$url"}}}])

$addToSet	
将值插入生成的文档中的数组，但不会创建重复项。	
db.mycol.aggregate([{$group : {_id : "$by_user", url : {$addToSet : "$url"}}}])

$first	
根据分组从源文档获取第一个文档。 通常情况下，这只适用于以前应用的“$sort”阶段。	db.mycol.aggregate([{$group : {_id : "$by_user", first_url : {$first : "$url"}}}])

$last	
根据分组从源文档获取最后一个文档。通常情况下，这只适用于以前应用的“$sort”阶段。	
db.mycol.aggregate([{$group : {_id : "$by_user", last_url : {$last : "$url"}}}])
```

``` bash
// 管道概念   
在UNIX命令中，shell管道可以对某些输入执行操作，并将输出用作下一个命令的输入。
MongoDB也在聚合框架中支持类似的概念。每一组输出可作为另一组文档的输入，并生成一组生成的文档(或最终生成的JSON文档在管道的末尾)。这样就可以再次用于下一阶段等等。
// 以下是在聚合框架可能的阶段
$project - 用于从集合中选择一些特定字段。
$match - 这是一个过滤操作，因此可以减少作为下一阶段输入的文档数量。
$group - 这是上面讨论的实际聚合。
$sort - 排序文档。
$skip - 通过这种方式，可以在给定数量的文档的文档列表中向前跳过。
$limit - 限制从当前位置开始的给定数量的文档数量。
$unwind - 用于展开正在使用数组的文档。使用数组时，数据是预先加入的，此操作将被撤销，以便再次单独使用文档。 因此，在这个阶段，将增加下一阶段的文件数量。
```

# MongoDB复制集

1. 复制是跨多个服务器同步数据的过程。
2. 复制提供冗余，并通过不同数据库服务器上的多个数据副本增加数据可用性。 
3. 复制保护数据库免受单个服务器的丢失。 
4. 复制还允许从硬件故障和服务中断中恢复。 
5. 使用其他数据副本，可以将其专用于灾难恢复，报告或备份。  

为什么复制？
* 保持数据安全
* 数据的高可用性(24 * 7)
* 灾难恢复
* 维护无停机(如备份，索引重建，压缩)
* 读取缩放(额外的副本可读)
* 副本集对应用程序是透明的  

MongoDB复制的工作原理
1. MongoDB通过使用副本集来实现复制。
2. 副本集是托管相同数据集的一组 mongod 实例。 
3. 在一个副本中，一个节点是接收所有写操作的主节点。
4. 所有其他实例(例如辅助节点)都应用主节点的操作，以便它们具有相同的数据集。 
5. 副本集可以只有一个主节点。

* 副本集是一组两个或多个节点(通常最少需要3个节点)
* 在副本集中，一个节点是主节点，其余节点是次要节点
* 所有数据从主节点复制到辅助节点。
* 在自动故障切换或维护时，选择为主节点建立，并选择新的主节点。
* 恢复故障节点后，它再次加入副本集，并作为辅助节点。
* 客户端应用程序始终与主节点进行交互，然后主节点将数据复制到辅助节点。

副本集功能
* N个节点的集群
* 任何一个节点都可以是主节点
* 所有写入操作都转到主节点操作
* 自动故障切换
* 自动恢复
* 共识一般选举

将独立的 MongoDB 实例转换为副本集  
`mongod --port "PORT" --dbpath "YOUR_DB_DATA_PATH" --replSet "REPLICA_SET_INSTANCE_NAME"`  
1. 关机正在运行 MongoDB 服务器。
2. 通过指定 `replSet` 选项启动 MongoDB服务器。
``` bash
mongod --port 27017 --dbpath "D:\set up\mongodb\data" --replSet rs0
// 它在端口27017上启动名称为rs0的 mongod 实例。
// 现在启动命令提示符并连接到这个 mongod 实例。
// 在Mongo客户端中，发出命令rs.initiate() 以启动新的副本集。
// 要检查副本集配置，可使用命令rs.conf()。 
// 要检查复制集的状态，请使用命令rs.status()
```

将会员添加到副本集:  
1. 要将成员添加到副本集，请在多台计算机上启动 mongod 实例。 
2. 现在启动一个 mongo 客户端并发出一个命令rs.add()。rs.add(HOST_NAME:PORT)

示例:   
1. 假设您的 mongod 实例名称是 mongod1.net，它在端口 27017 上运行。
2. 要将此实例添加到副本集，请在 Mongo 客户端中发出命令 rs.add()。
``` bash
rs.add("mongod1.net:27017")
// 只能在连接到主节点时，将 mongod 实例添加到副本集。要
// 检查是否连接到主服务器，请在 mongo 客户端中发出命令db.isMaster()。

rs0:PRIMARY> db.isMaster()
{
  "hosts" : [
    "ubuntu:27017"
  ],
  "setName" : "rs0",
  "setVersion" : 1,
  "ismaster" : true,
  "secondary" : false,
  "primary" : "ubuntu:27017",
  "me" : "ubuntu:27017",
  "electionId" : ObjectId("7fffffff0000000000000001"),
  "lastWrite" : {
    "opTime" : {
      "ts" : Timestamp(1498896581, 1),
      "t" : NumberLong(1)
    },
    "lastWriteDate" : ISODate("2017-07-01T08:09:41Z")
  },
  "maxBsonObjectSize" : 16777216,
  "maxMessageSizeBytes" : 48000000,
  "maxWriteBatchSize" : 1000,
  "localTime" : ISODate("2017-07-01T08:09:50.365Z"),
  "maxWireVersion" : 5,
  "minWireVersion" : 0,
  "readOnly" : false,
  "ok" : 1
}
rs0:PRIMARY>
```

# MongoDB分片  
* 分片是在多台机器之间存储数据记录的过程，
* MongoDB是满足数据增长需求的方法。 
* 随着数据的大小增加，单个机器可能不足以存储所有数据，也不能提供可接受的读写吞吐量。 
* 分片解决了水平缩放的问题。 使用分片，可以添加更多的机器来支持数据增长和读写操作的需求。

为什么要分片？
* 在复制中，所有写入都转到主节点
* 延迟敏感查询到主节点
* 单个副本集合有12个节点的限制
* 当活动数据集较大时，内存不足够大
* 本地磁盘不够大
* 垂直扩缩太昂贵了

MongoDB中的分片:
1. 碎片(Shards) - 碎片用于存储数据。它们提供高可用性和数据一致性。 在生产环境中，每个分片是一个单独的副本集。
2. 配置服务器(Config Servers) - 配置服务器存储集群的元数据。 该数据包含集群的数据集与分片的映射。查询路由器使用此元数据将操作定位到特定的分片。 在生产环境中，分片集群正好有3个配置服务器。
3. 查询路由器(Query Routers) - 查询路由器基本上是 mongo 实例，与客户端应用程序的接口和直接操作到适当的分片。 查询路由器处理并将操作定向到碎片，然后将结果返回给客户端。 分片集群可以包含多个查询路由器来分割客户端请求负载。 客户端向一个查询路由器发送请求。 一般来说，分片集群有许多查询路由器。

# MongoDB备份与恢复
1. 创建备份: `mongodump` 该命令会将服务器的所有数据恢复到目录/bin/dump/
2. 恢复数据: `mongorestore` 该命令回从备份文件里恢复数据
``` bash

// 以下是可用于 mongodump 命令的可用选项的列表。

mongodump —host HOST_NAME —port PORT_NUMBER	
此命令将备份指定的 mongod 实例的所有数据库。	
mongodump --host 127.0.0.1 --port 27017

mongodump —out BACKUP_DIRECTORY	
此命令将仅在指定路径上备份数据库。	
mongodump --out /home/yiibai/mongobak

mongodump —collection COLLECTION —db DB_NAME	
此命令将仅备份指定数据库的指定集合。	
mongodump --collection mycol --db test
```

# MongoDB部署
1. mongostat 此命令检查所有运行的mongod实例的状态，并返回数据库操作的计数器。 这些计数器包括插入，查询，更新，删除和游标。 命令还显示遇到页面错误，并显示锁定百分比。这可以用来监控内存不足，写入容量或出现性能问题。要运行命令，首先要启动mongod实例。 在另一个命令提示符下，转到 mongodb 安装的bin目录，然后键入：mongostat。
2. mongotop此命令跟踪并报告基于集合的 MongoDB 实例的读写活动。 默认情况下，mongotop会在每秒钟内返回信息，但是可相应地更改信息。应该检查此读写活动是否符合您的应用意图，并且要一次对数据库发出太多的写入操作，从磁盘读取的频率太高，或者超出了工作集合大小。要运行命令，请启动 mongod 实例。 在另一个命令提示符下，转到 mongodb 安装的bin目录，然后键入：mongotop。
3. 除了MongoDB工具外，10gen 还提供了一个免费的托管监控服务MongoDB管理服务(MMS)，它提供了一个仪表盘，可以让您了解整个集群的指标。