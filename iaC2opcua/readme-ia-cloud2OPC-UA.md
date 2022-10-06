# ia-cloud object --> OPC-UA server item 

## functional summary
Node-RED node to convert from ia-cloud objects to OPC-UA server deta items.

## functionality detailes

### OPC-UA folder to store variables
OPC-UA server item node would add a folder to /Objects with the name of node property [folder name]. If the new objectKey of the ia-cloud object received form input message, would add a new subfolder with the name of [objectKey] to the folder /Objects/[folder name]. all properties of the ia-cloud object would be added as OPC-UA variables under this each objectKey folder.

dataItems do not have commonName
```
ia-cloud-data
    ├── objectKey1
    │   ├── objectKey1 + ".obkectKey"
    │   ├── objectKey1 + ".cobjectDescription"
    │   ├── objectKey1 + ".objectContet"
    │   ├── objectKey1 + ".contentType"
    │   ├── objectKey1.dataName + ".dataName"
    │   ├── objectKey1.dataName + ".dataValue"
    │   ├── objectKey1.dataName + ".unit"
    │   ├── objectKey1.dataName + ".dataName"
    │   ├── objectKey1.dataName + ".dataValue"
    │   └── objectKey1.dataName + ".unit"
    │
    └── objectKey2
       ├── objectKey2 + ".obkectKey"
       ├── objectKey2 + ".cobjectDescription"
       ├── objectKey2 + ".objectContet"
```
dataItems do have commonName
```
ia-cloud-data
    ├── objectKey
    │   ├── objectKey + ".obkectKey"
    │   ├── objectKey + ".cobjectDescription"
    │   ├── objectKey + ".objectContet"
    │   ├── objectKey + ".contentType"
    │   ├── objectKey.commonName + ".commonName"
    │   ├── objectKey.commonName + ".dataName"
    │   ├── objectKey.commonName + ".dataValue"
    │   ├── objectKey.commonName + ".unit"
    │   ├── objectKey.commonName + ".commonName"
    │   ├── objectKey.commonName + ".dataName"
    │   ├── objectKey.commonName + ".dataValue"
    │   ├── objectKey.commonName + ".unit"
    │
    └── objectKey
       ├── objectKey + ".obkectKey"
       ├── objectKey + ".cobjectDescription"
       ├── objectKey + ".objectContet"
```

### OPC-UA namespace and node ids

At this point, OPC-UA namespace that would be used with ia-cloud objects is ns = 1, urn:userhostname:NodeOPCUA-Server, because of the limitation of the node-red-contrib-opcua package.
ns and namepace could net be changed in Node-RED editor.

A node ids for ia-cloud object and object property are automatically generated form objectKey, and dataName or commonName of dataItem.
See above ia-cloud object folder structure.

### OPC-UA datatype 
ia-cloud object property would be convrted OPC-UA datatype , as the following.

| ia-cloud object properties | OPC-UA node Ids | description |
|:----------|:-----:|:--------------------|
|string     |String     |timestamp would be also converted to String datatype、 not date datatype.   |
|number     |Double     |all of number type data would be converted to Double datatype |
|boolean    |Boolean    |           |
|[string,]  |StringArray[]  | dimension of array would be set to the number od elements of the first object write.  |
|[number,]  |DoubleArray[]  | dimension of array would be set to the number od elements of the first object write.  |
|[boolean,] |BooleanArray[] | dimension of array would be set to the number od elements of the first object write.  |
|{object}   |String         | object would be converted to JSON string by JSON.stringify()      |
|[{object} ]|String         | object array would be converted to JSON string by JSON.stringify()      |

## input message

- ``msg.request``: request of ia-cloud Web API. "store" is only accepted.
- ``msg.dataObject``: ia-cloud object. ia-cloud object array is not allowed

example
 ```
{
  "request": "store",
  "dataObject": {
      "objectType" : "iaCloudObject",
      "objectKey" : { string } ,
      "objectDescription" : { string },
      "timestamp" : { string },
      "objectContent" : { iaCloudObjectContent }
  }
}
 ```

## output message

This node outputs messages for OPC-UA server node.
Using commands,  
addFolder  
setFolder  
addVariable

in a msg.payload. and those parameters in a msg.topic

## node properties

| name | type | description |
|:----------|:-----:|:--------------------|
|ns    |number     | namespace number for ia-cloud object and dataItem properties. fixed ns = 1     |
|name space name     |string     |namespace name that would be generated automatically |
|node name    |string    | name for ia-cloud2opc-ua node instance          |