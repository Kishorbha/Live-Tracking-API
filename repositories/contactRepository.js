module.exports.getCodeContactNumber = (phoneCode, contactNumber) => {
    let codeContactNumber = null
    if (typeof phoneCode === 'string' && typeof contactNumber === 'string') {
        contactNumber = contactNumber.indexOf('+') < 0 ? phoneCode + contactNumber : contactNumber
        codeContactNumber = contactNumber.indexOf('+') < 0 ? '+' + contactNumber : contactNumber
    } else if (typeof contactNumber === 'string') {
        codeContactNumber = contactNumber.indexOf('+') < 0 ? '+' + contactNumber : contactNumber
    }
    return typeof codeContactNumber === 'string' ? codeContactNumber.replace(' ', '') : codeContactNumber
}