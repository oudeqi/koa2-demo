
# MongoDB关联关系
``` bash
-------------------------------------
// user文档
{
   "_id":10999110,
   "name": "Maxsu",
   "contact": "13888990021",
   "dob": "1992-10-11"
}
// address文档
{
   "_id":12200,
   "building": "Hainan Building NO.2100",
   "pincode": 571100,
   "city": "Haikou",
   "province": "Hainan"
}

-------------------------------------
嵌入式建模
// 该方法将所有相关数据保存在单个文档中，这使得检索和维护更容易。
// 可以使用单个查询来在整个文档检索
// 缺点是如果嵌入式文档的大小如果不断增长，可能会影响读/写性能。
{
   "_id": 21000100,
   "contact": "13800138000",
   "dob": "1991-11-11",
   "name": "Maxsu",
   "address": [
      {
         "building": "Hainan Building NO.2100",
         "pincode": 571100,
         "city": "Haikou",
         "province": "Hainan"
      },
      {
         "building": "Sanya Building NO.2100",
         "pincode": 572200,
         "city": "Sanya",
         "province": "Hainan"
      },
   ]
}

-------------------------------------
引用方法建模
// 使用这种方法，需要两个查询：
// 首先从用户文档获取address_ids字段，然后从地址集中获取这些地址。
{
   "_id":ObjectId("52ffc33321332111sdfaf"),
   "contact": "13800138000",
   "dob": "1991-11-11",
   "name": "Maxsu",
   "address_ids": [
      ObjectId("123123"),
      ObjectId("123412")
   ]
}
```
# MongoDB数据库引用
DBRefs中有三个字段
1. $ref - 此字段指定引用文档的集合
2. $id - 此字段指定引用文档的_id字段
3. $db - 这是一个可选字段，并包含引用文档所在的数据库的名称
``` bash
// 具有DBRef字段address的 用户文档
{
  "_id":ObjectId("348362491fjaskdlf2314"),
  "address": {
    "$ref": "address_home",
    "$id": ObjectId("sfaafdf4137832149fssa"),
    "$db": "yiibai"
  },
  "contact": "13800138000",
  "dob": "1991-12-12",
  "name": "Maxsu"
}
// address指定引用的地址文件位于
// yiibai数据库中的address_home集合中，其ID为sfaafdf4137832149fssa。

>var user = db.users.findOne({"name":"Maxsu"}) // 查询用户
>var dbRef = user.address // 用户文档的DBRef字段address
>db[dbRef.$ref].findOne({"_id": (dbRef.$id)}) // 查询地址

// 以上代码返回address_home集合中存在的以下address文档
{
  "_id" : ObjectId("sfaafdf4137832149fssa"),
  "building" : "Hainan Apt No.2100",
  "pincode" : 571100,
  "city" : "Haikou",
  "province" : "Hainan"
}
```

# MongoDB覆盖查询
什么是覆盖查询?
1. 查询中的所有字段都是索引的一部分。
2. 查询中返回的所有字段都在同一个索引中。  

使用覆盖查询:  
由于查询中存在的所有字段都是索引的一部分，所以MongoDB查询指定条件匹配，并使用相同的索引返回结果，而不会实际查找文档。由于索引存在于RAM/内存中，与通过扫描文档获取数据相比，从索引获取数据更快。
``` bash
// 测试文档
{
   "_id": ObjectId("234324fd852426020001111"),
   "contact": "13800138000",
   "dob": "1991-11-11",
   "gender": "M",
   "name": "Maxsu",
   "user_name": "user_maxsu"
}
// users集合 的字段：gender 和 user_name 上创建一个复合索引
db.users.ensureIndex({gender:1,user_name:1})

// 现在，这个索引将覆盖以下查询
db.users.find({gender:"M"},{user_name:1,_id:0})

也就是说，对于上述查询，MongoDB不会查找数据库文档。相反，它将直接从索引数据中获取所需的数据。

// 由于索引不包括_id字段，在上面示例中，已经将其从查询的结果集中明确排除，
// 因为MongoDB默认情况下在每个查询中返回_id字段。 
// 所以下面的查询不会在上面创建的索引中被覆盖(查询有返回_id字段) 
db.users.find({gender:"M"},{user_name:1})
```
最后，请记住，如果有下列情况，则索引无法覆盖查询
1. 任何索引的字段是一个数组
2. 任何索引的字段是一个子文档

# MongoDB分析查询
分析查询是衡量数据库和索引设计的有效性的一个非常重要的方式。 

1. $explain操作符: 提供有关查询的信息，查询中使用的索引和其他统计信息。它在在分析索引优化情况时非常有用。
2. $hint操作符: 强制查询优化器使用指定的索引来运行查询。当要测试具有不同索引的查询的性能时，这就特别有用了

``` bash
db.users.ensureIndex({gender:1,user_name:1}) // 创建索引
db.users.find({gender:"M"},{user_name:1,_id:0}).explain() 
// explain()查询返回以下分析结果
{
   "cursor" : "BtreeCursor gender_1_user_name_1",
   "isMultiKey" : false,
   "n" : 1,
   "nscannedObjects" : 0,
   "nscanned" : 1,
   "nscannedObjectsAllPlans" : 0,
   "nscannedAllPlans" : 1,
   "scanAndOrder" : false,
   "indexOnly" : true,
   "nYields" : 0,
   "nChunkSkips" : 0,
   "millis" : 0,
   "indexBounds" : {
      "gender" : [
         [
            "M",
            "M"
         ]
      ],
      "user_name" : [
         [
            {
               "$minElement" : 1
            },
            {
               "$maxElement" : 1
            }
         ]
      ]
   }
}
// indexOnly的true值表示此查询已使用索引。
// cursor字段指定使用的游标的类型。BTreeCursor类型表示使用了索引，并且还给出了使用的索引的名称。 BasicCursor表示完全扫描，而不使用任何索引的情况。
// n表示返回的文档数。
// nscannedObjects表示扫描的文档总数。
// nscanned表示扫描的文档或索引条目的总数。

---------------------------------------------------
// 以下查询指定 要用于此查询的gender和user_name字段的索引
db.users.find({gender:"M"},{user_name:1,_id:0}).hint({gender:1,user_name:1})
// $explain来分析上述查询
db.users.find({gender:"M"},{user_name:1,_id:0}).hint({gender:1,user_name:1}).explain()
```

# MongoDB原子操作
1. MongoDB不支持多文档原子事务。 (注意新版本支持情况)
2. 但是，它可以为单个文档提供了原子操作。 因此，如果文档有一百个字段，则更新语句将更新或不更新所有字段的值，因此在原始级别保持原子性。

原子操作模型数据：  
维持原子性的推荐方法是将所有相关信息保存在一起，并使用嵌入式文档在一个文档中一起更新。 这将确保单个文档的所有更新都是原子的。
``` bash
{
   "_id":1,
   "product_name": "Huawei P9",
   "category": "mobiles",
   "product_total": 5,
   "product_available": 3,
   "product_bought_by": [
      {
         "customer": "Kobe",
         "date": "2017-07-08"
      },
      {
         "customer": "Maxsu",
         "date": "2018-07-28"
      }
   ]
}
// 在上面这个文档中，已经在product_bought_by字段中嵌入了购买产品的客户的信息。 
// 现在，当有新客户购买产品，首先查看product_available字段检查产品存货是否仍然够用。
// 如果可用，则减少product_available字段的值，
// 并将新客户的嵌入式文档插入到product_bought_by字段中。

// 下面将使用findAndModify命令来执行此功能，因为它会以同样的方式搜索和更新文档。
db.products.findAndModify({ 
   query:{_id: 2, product_available: {$gt: 0}}, 
   update:{ 
      $inc: {product_available:-1}, 
      $push: {product_bought_by: {customer: "Curry", date: "2017-08-08"}} 
   }    
})
// 嵌入式文档和使用findAndModify查询的方法确保产品购买信息仅在产品可用时才更新。
// 而整个这个事务在同一个查询中是原子的

// 与此相反的是如果分别保留产品数量，以及谁购买产品的信息。
// 在这种情况下，我们将首先使用第一个查询检查产品是否可用。
// 然后在第二个查询中更新购买信息。 
// 但是，有可能在执行这两个查询时(还未执行完)，其他一些用户已经购买了该产品，并且此产品缺货了。
// 但是由于程序执行过程中并不知晓，第二个查询将根据第一个查询的结果更新购买信息。
// 这会导致数据库不一致，因为产品已经没有库存，但是仍然断续销售。
```

# MongoDB高级索引
``` bash
// 模拟文档 -- 包含地址子文档和标签数组
{
   "address": {
      "city": "Haikou",
      "province": "Hainan",
      "pincode": "123456"
   },
   "tags": [
      "music",
      "cricket",
      "blogs"
   ],
   "name": "Maxsu"
}
```

索引数组字段  
* 假设要根据用户的标签搜索用户文档。为此，我们将在集合中的tags数组上创建一个索引。
* 在数组上创建一个索引依次为每个字段创建单独的索引条目。
* 所以在这个例子中，当在tags数组上创建一个索引时，将为其值music，cricket和blogs创建单独的索引。
``` bash
// tags数组上创建索引
db.users.ensureIndex({"tags":1})

// 创建索引后，可以搜索这个集合的标签字段
db.users.find({tags:"cricket"})

// 要验证是否使用正确的索引，请使用以下说明命令
// 下面的命令生成：“cursor”：“BtreeCursor tags_1”，它确认使用了正确的索引
db.users.find({tags:"cricket"}).explain()
```

索引子文档字段
* 假设要搜索基于city，province 和 pincode字段的文档。 
* 由于所有这些字段都是地址子文档字段的一部分，因此将在子文档的所有字段上创建一个索引。
``` bash
// 在子文档的所有三个字段上创建索引
db.users.ensureIndex({"address.city":1,"address.province":1,"address.pincode":1})

// 创建索引后，就可以使用此索引来搜索任何子文档的字段了
db.users.find({"address.city":"Haikou"})

// 查询表达式必须遵循指定的索引的顺序。 所以上面创建的索引将支持以下查询
db.users.find({"address.city":"Haikou","address.province":"Hainan"})
db.users.find({"address.city":"Haikou","address.province":"Hainan", "address.pincode":"12345"})
```

# MongoDB索引限制
1. 索引额外开销: 每个索引占用一些空间，并导致每次插入，更新和删除的开销。因此，如果很少使用集合进行读取操作(大部分是插入或更新操作)，则建议不要使用索引。
2. RAM/内存的使用: 由于索引存储在RAM中，因此应确保索引的总大小不超过RAM限制。 如果总大小超过了系统内存的大小，MongoDB将开始删除一些索引，从而导致性能下降。
3. 索引键限制: 从MongoDB 2.6版本开始，如果现有索引字段的值超过索引键限制，MongoDB将不会创建索引。
4. 插入超过索引键限制的文档: 如果本文档的索引字段值超过索引键限制，MongoDB将不会将任何文档插入索引集合。 mongorestore和mongoimport工具也是如此。

查询限制: 索引不能在使用的查询中使用
1. 正则表达式或否定运算符，如$nin，$not等
2. 算术运算符，如$mod等
3. $where子句

索引最大范围
1. 集合不能有超过64个索引。
2. 索引名称的长度不能超过125个字符。
3. 复合索引最多可以编号31个字段。

# MongoDB ObjectId
* MongoDB使用ObjectIds作为每个文档的_id字段的默认值，这是在创建任何文档时生成的。 
* ObjectId的复杂组合使得所有_id字段都是唯一的

``` bash

newObjectId = ObjectId()
// 上述语句返回以下唯一生成的id
ObjectId("595b99d9f6a6243715b3c312")

// 还可以提供一个12字节的 id 来可代替 MongoDB 生成 ObjectId
myObjectId = ObjectId("595b99d9f6a6243715b3c312")
```

ObjectId 是具有以下结构的12字节BSON类型
1. 前4个字节表示从unix纪元开始的秒数
2. 接下来的3个字节是机器标识符
3. 接下来的2个字节由进程ID组成
4. 最后3个字节是随机计数器值

创建文档的时间戳:  
* 由于_id ObjectId默认存储4字节的时间戳，在大多数情况下，不需要存储任何文档的创建时间。
* 可以使用getTimestamp方法获取文档的创建时间
* 将以ISO日期格式返回此文档的创建时间
``` bash
ObjectId("595b99d9f6a6243715b3c312").getTimestamp()
ISODate("2017-07-04T13:36:25Z")
```

将ObjectId转换为String: 
* 在某些情况下，可能需要使用字符串格式的ObjectId值。 
* 使用 newObjectId.str 将返回Guid的字符串格式
``` bash
newObjectId.str
595b99d9f6a6243715b3c312
```

# MongoDB Map Reduce
* 根据MongoDB文档的说明，Map-reduce是将大量数据合并为有用的聚合结果的数据处理范例。 
* MongoDB使用mapReduce命令进行map-reduce操作。
* MapReduce通常用于处理大型数据集。

# MongoDB文本搜索
* 与正常搜索相比，使用文本搜索极大地提高了搜索效率。
* 从MongoDB 2.4版开始，MongoDB开始支持文本索引来搜索字符串内容。
* 文本搜索使用词法技术通过删除字符串字词，如a，an等等来查找字符串字段中的指定单词

启用文本搜索: 
* 最初，文本搜索是一个实验性功能，但从MongoDB 2.4版开始，默认情况下启用配置。 
* 但是，如果使用2.4之前版本的MongoDB，则必须使用以下代码启用文本搜索 
`db.adminCommand({setParameter:true,textSearchEnabled:true})`

``` bash
// 模拟文档
{
   "post_text": "enjoy the mongodb articles on yiibai tutorials",
   "tags": [
      "mongodb",
      "yiibai tutorials"
   ]
}

// post_text字段上创建一个文本索引，以便可以在posts的文本中搜索
db.posts.ensureIndex({post_text:"text"})

// 使用文本索引
db.posts.find({$text:{$search:"yiibai"}})

// 如果您使用旧版本的MongoDB，则必须使用以下命令
db.posts.runCommand("text",{search:" yiibai "})

// 删除文本索引
db.posts.getIndexes() // 找到索引的名称
db.posts.dropIndex("post_text_text")
```

# MongoDB正则表达式
* 正则表达式在所有的编程语言中经常使用，用于以搜索任何字符串中的模式或单词。 
* MongoDB还提供使用$regex运算符的字符串模式匹配的正则表达式的功能。 
* MongoDB使用PCRE(Perl兼容正则表达式)作为正则表达式语言。
``` bash
// 模拟文档
{
   "post_text": "enjoy the mongodb articles on yiibai tutorials",
   "tags": [
      "mongodb",
      "yiibai"
   ]
}
// 搜索包含"yiibai"字符串的所有帖子
db.posts.find({post_text:{$regex:"yiibai"}})

// 也可以写成
db.posts.find({post_text:/yiibai/})

// 使用不区分大小写的正则表达式
db.posts.find({post_text:{$regex:"yiibai", $options:"$i"}})

// 也可以在数组字段上使用正则表达式。当实现标签的功能时，这尤其重要。 
// 如果要从单词：tutorial(tutorial，tutorials，tutorialpoint，tutorialphp，tutorialpython 或 tutorialphp)开始搜索所有具有标签的帖子，可以使用以下代码
db.posts.find({tags:{$regex:"tutorial"}})
```
优化正则表达式查询：
* 如果文档字段创建了索引，则查询将使用索引值来匹配正则表达式。 与正常表达式扫描整个集合相比，使用索引值使得搜索非常快。
* 如果正则表达式是前缀表达式，则所有匹配都是以某个字符串字符开始。 例如，如果正则表达式是^tut，则查询必须仅搜索以tut开头的那些字符串。

# MongoDB GridFS
* GridFS是用于存储和检索大型文件(如图像，音频文件，视频文件等)的MongoDB规范。
* 它是一种用于存储文件的文件系统，但其数据存储在MongoDB集合中。 
* GridFS存储文件可超过文件大小限制为16MB的功能。
* GridFS将文件划分成块，并将每个数据块存储在单独的文档中，每个文件的最大大小为255k。
* 默认情况下，GridFS使用两个集合fs.files和fs.chunks来存储文件的元数据和块。 
* 每个块由其唯一的ObjectId字段_id标识。 
* fs.files作为父文档进行切换。 fs.chunks文档中的files_id字段将该块链接到其父块。

``` bash
// fs.files集合的示例文档
// 文档指定文件名，块大小，上传的日期和长度。
{
   "filename": "test.txt",
   "chunkSize": NumberInt(261120),
   "uploadDate": ISODate("2018-04-13T11:32:33.557Z"),
   "md5": "7b762939321e146569b07f72c62cca4f",
   "length": NumberInt(646)
}
// fs.chunks文档的示例文档
{
   "files_id": ObjectId("595b99d9f6a6243715b3c312"),
   "n": NumberInt(0),
   "data": "Mongo Binary Data"
}
```

将文件添加到GridFS:
* 使用put命令存储一个使用GridFS的mp3文件。 
* 为此，将使用MongoDB安装文件夹的bin文件夹中出现的mongofiles.exe工具程序。

``` bash
D:\Program Files\MongoDB\Server\3.4\bin> mongofiles.exe -d gridfs put song.mp3
// gridfs是要存储文件的数据库的名称。 
// 如果数据库不存在，MongoDB将自动创建一个新的文档。 
// song.mp3是上传文件的名称。 

// 要在数据库中查看文件的文档，可以使用查询查询
db.fs.files.find()
// 上述命令返回以下文档 
{
   _id: ObjectId('595b99d9f6a6243715b3c316'), 
   filename: "song.mp3", 
   chunkSize: 381120, 
   uploadDate: new Date(1398391643474), md5: "e4f53379c909f7bed2e9d631e15c1c41",
   length: 10401959 
}

// 还可以使用以前查询中返回的文档ID，
// 查看与存储文件相关的fs.chunks集合中存在的所有块，并使用以下代码：
db.fs.chunks.find({files_id:ObjectId('595b99d9f6a6243715b3c316')})
// 在这个示例中，查询返回50多个文件，表示整个mp3文件被分成50个数据块
````
# MongoDB固定循环集合
1. MongoDB固定集合(Capped collections)是固定大小的循环集合，遵循插入顺序以支持创建，读取和删除操作的高性能。
2. 通过循环，当分配给集合的固定大小被耗尽时，它将开始删除集合中最旧的文档，而不用提供任何明确的命令。
3. 如果更新导致增加的文档大小，固定集合会限制文档的更新。 
4. 由于上限集合按照磁盘存储的顺序存储文档，因此可确保文档大小不会增加磁盘上分配的大小。
5. 固定集合最适用于存储日志信息，缓存数据或任何其他高容量数据。

``` bash

// 创建固定集合
db.createCollection("cappedLogCollection",{capped:true,size:99999})

// 除了指定集合大小，还可以使用max参数限制集合中的文档数量
db.createCollection("cappedLogCollection",{capped:true,size:99999,max:1000})

// 要查看集合是否固定，请使用以下isCapped命令
db.cappedLogCollection.isCapped()

// 将一个集合转换为上限的集合，则可以使用以下代码进行操作
db.runCommand({"convertToCapped":"posts",size:99999})

// 查询固定集合
// 默认情况下，在固定集合上查询将以插入顺序显示结果。
// 但是，如果要以相反的顺序检索文档，请使用sort命令
db.cappedLogCollection.find().sort({$natural:-1})
```

关于固定集合值得注意的几个要点: 
* 无法从固定集合中删除文档。
* 固定集合中没有默认索引，甚至不在_id字段上。
* 在插入新文档时，MongoDB不需要在磁盘上实际寻找一个容纳新文档的位置。它可以随便地将新文档插入集合的尾部。这样就使得在固定集合中的插入操作非常快。
* 类似地，在读取文档的同时，MongoDB按照磁盘上存储的顺序返回文档。这样使读取操作非常快。

# MongoDB自动递增序列
* MongoDB中没有类似SQL数据库中那么拿来即用的自动增量功能。 
* 默认情况下，它使用_id字段的12字节ObjectId作为唯一标识文档的主键。 
* 但是，可能存在我们可能希望_id字段拥有除ObjectId之外的一些自动递增值的情况。
* 由于MongoDB不提供默认自动增长功能，所以我们通过使用MongoDB文档中所建议的计数器集合以编程的方式来实现此功能。

``` bash
// 考虑以下product文档。 我们希望_id字段是从:1,2,3,4到n开始的自动递增整数序列。
{
  "_id":1,
  "product_name": "Huawei P9",
  "category": "mobiles"
}
// 为此，创建一个计数器集合，它将跟踪所有序列字段的最后一个序列值。
db.createCollection("counters")

// 现在，将把以下文档插入计数器集合中，以productid作为键
{
  "_id":"productid",
  "sequence_value": 0
}

// 字段sequence_value跟踪序列的最后一个值。使用以下代码将此序列文档插入计数器集合中
db.counters.insert({_id:"productid",sequence_value:0})

// 现在将在创建一个新文档时使用函数getNextSequenceValue，
// 并将返回的序列值分配为文档的_id字段的值。
db.products.insert({
   "_id":getNextSequenceValue("productid"),
   "product_name":"HuaWei P9",
   "category":"mobiles"
})
db.products.insert({
   "_id":getNextSequenceValue("productid"),
   "product_name":"OPPO X6s",
   "category":"mobiles"
})
```

