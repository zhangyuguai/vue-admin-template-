//快速把obj1里面对应的数据复制到obj2
export default function objCopy(obj1,obj2){
  Object.keys(obj1).forEach(function(key){
    obj2[key]=obj1[key];
  })
}
