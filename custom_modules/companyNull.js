

module.exports = function isCompanyNull(company) {
    if(company === null || company === undefined) {
        console.log("Company is Null or Undefined");
        return (
        true
        )
    } else {
        return (false)
    };
};