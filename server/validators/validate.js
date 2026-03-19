function validateFields(body, allowedFields, requiredFields = []) {
    // 1) Reject unknown fields -> we achieve this by extracting only allowed fields
    const unknownFields = Object.keys(body).filter(key => !allowedFields.includes(key));
    if (unknownFields.length > 0) {
        throw new Error(`حقول غير معروفة: ${unknownFields.join(', ')}`);
    }

    // 2) Enforce required fields
    const missingFields = requiredFields.filter(f => body[f] === undefined || body[f] === null || body[f] === '');
    if (missingFields.length > 0) {
        throw new Error(`الحقول التالية مطلوبة: ${missingFields.join(', ')}`);
    }

    const cleanData = {};
    for (const key of allowedFields) {
        if (body[key] !== undefined) {
            cleanData[key] = body[key];
        }
    }
    return cleanData;
}

module.exports = { validateFields };
