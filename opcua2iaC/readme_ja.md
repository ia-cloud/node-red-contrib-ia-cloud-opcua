# OPC UA Server Items to ia-Cloud

---

## 概要
[node-red-contrib-opcua](https://www.npmjs.com/package/node-red-contrib-opcua)ノードを使用してOPC UA Serverよりデータを取得し、ia-Cloudにデータを送信します。  
OPC UA Serverとの接続に関しては[node-red-contrib-opcua](https://www.npmjs.com/package/node-red-contrib-opcua)を参照してください。

---

## 構成

![接続構成図](NodeConnect.png)

OPC UA Serverのデータをia-Cloudにデータを送信するには、ia-Cloudに送信するデータの設定が必要です。
データはia-cloud->UAitemノードで定義します。定義したデータと、OPC UA Clientノードより取得したデータ値をもとにia-cloudオブジェクトを作成し、[ia-cloud接続ノード](https://github.com/ia-cloud/node-red-contrib-ia-cloud-fds/blob/master/ia-cloud-cnct/readme.md)や[オブジェクトアレーノード](https://github.com/ia-cloud/node-red-contrib-ia-cloud-fds/blob/master/ia-cloud-object-array/readme.md)を使用して、ia-Cloudに送信します。

---

## ia-cloud->UAitemノード

ia-Cloudにデータ送信を行うために必要な情報とOPC UA Itemを登録します。  

### プロパティ

|名称|説明|
|:--|:--|
|OPC Action|OPC UA Clientで設定するActionを選択します。サポートしているActionは以下の3つです。<br>- READ<br>- READ MULTIPLE<br>- SUBSCRIBE|

- オブジェクトの設定タブ

|名称|説明|
|:--|:--|
|起動後待機(秒)|フローの起動時にOPC UA Clientノードへの送信を待機する必要の場合、待機時間を秒数で設定します。|
|定期収集周期(秒)|READ、READ MULTIPLEを使用時に定期的にOPC UA Clientノードへ送信をする場合に秒数で設定します。<br>定期収集が不要な場合は0を指定します。<br>SUBSCRIBEを使用する場合、周期指定はOPC UA Clientノードで指定します。|
|オブジェクトキー|OPC UA Serverのデータ項目に付与するユニークなキー文字列を指定します。|
|オブジェクトの説明|OPC UA Serverのデータ項目のわかりやすい説明を記載します。|

- データの設定タブ

|名称|説明|
|:--|:--|
|データ構造型|OPC UA Serverのデータ構造名を指定します。ユーザ定義の組合せを定義しても良いが、デフォルトはiaCloudDataです。|
|データ名称|データ項目につける名称。同一オブジェクトキー内では重複しないよう設定します。|
|単位|データ項目に付与する単位を指定します。|
|ノードID|OPC UA Clientで指定するノードIDを指定します。|

### 入力
入力の内容に依存せず、設定されたプロパティに応じて出力します。

### 出力
出力1(上側)をUA->ia-cloudノードへ、出力2(下側)をOPC UA Clientノードに接続します。

---

## UA->ia-cloudノード

ia-cloud->UAitemノードで設定した内容と、OPC UA Clientノードから得たデータをもとにia-Cloudへのデータを作成・出力します。

### 入力

- ia-cloud->UAitemノードの出力1
  ia-cloud->UAitemの設定情報を取得します。
  ia-Cloudへ出力するにはia-cloud->UAitemの設定情報が必要です。
- OPC UA Clientノードの出力
  OPC UA Clientノードが読み出したOPC UA Serverのデータを取得します。

### 出力
ia-cloud接続ノード または オブジェクトアレーノードに接続します。

