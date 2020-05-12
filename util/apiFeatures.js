class ApiFeatures {
    constructor(query,queryStr){
      this.query = query
      this.queryStr = queryStr
    }
    filter(){
      const queryObj = {...this.queryStr}
      //remove some query from query string
      const excludedquery = ["limit","sort","fields","page","search"];
      excludedquery.forEach(eq => delete queryObj[eq])
      this.query = this.query.find(queryObj)
      return this
    }
    sort(){
      if(this.queryStr.sort){
        const sortBy = this.queryStr.sort.split(",").join(' ')
        this.query = this.query.sort(sortBy)
      }else{
        this.query = this.query.sort('-createdAt')
      }
      return this
    }
    paginate(){
      const page = this.queryStr.page * 1 || 1
      const limit = this.queryStr.limit * 1 || 4
      const skip = (page - 1) * limit
      this.query = this.query.skip(skip).limit(limit)
  
      return this
    }
    limitField(){
      if(this.queryStr.fields){
        const queryField = this.queryStr.fields.split(',').join(' ')
        this.query = this.query.select(queryField)    
      }else{
        this.query = this.query.select("-__v")
      }
      return this
    }
    search(){
      if(this.queryStr.search){
        this.query = this.query.find({$text:{$search:this.queryStr.search}})
      }
      return this 
    }
  }
  
module.exports = ApiFeatures  