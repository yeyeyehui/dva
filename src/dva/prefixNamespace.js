

function prefix(obj,namespace){
    return Object.keys(obj).reduce((memo,key)=>{
        const newKey = `${namespace}/${key}`;
        memo[newKey]=obj[key];
        return memo;
    },{});
   /*  let memo = {};
    for(let key in obj){
        memo[`${namespace}/${key}`]=obj[key];
    }
    return memo; */
}
function prefixNamespace(model){
    if(model.reducers){
        model.reducers=prefix(model.reducers,model.namespace);
    }
    if(model.effects){
        model.effects=prefix(model.effects,model.namespace);
    }
    return model;
}
export default prefixNamespace;