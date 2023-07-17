class Features {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  // Search Feature for Get products API
  search() {
    const keyword = this.queryStr.keyword
      ? {
          name: {
            $regex: this.queryStr.keyword,
            $options: "i",
          },
        }
      : {};

    this.query = this.query.find({ ...keyword });
    return this;
  }

  // Filter category feature for Get Products API
  filter() {
    const queryCopy = { ...this.queryStr };
  
    // Remove some fields for category
    const removeFields = ["keyword", "page", "limit"];
  
    removeFields.forEach((key) => delete queryCopy[key]);
  
    // Convert values to case-insensitive regex
    Object.keys(queryCopy).forEach((key) => {
      queryCopy[key] = { $regex: new RegExp(queryCopy[key], "i") };
    });
    
    this.query = this.query.find(queryCopy);
    return this;
  }
  
}

module.exports = Features;
