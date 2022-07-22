db.getCollection('grantpermissions').insert(
    {
        "permits": [
            {
                "role": "admin",
                "resource": "driver",
                "action": "create:any",
                "attributes": "*"
            },
            {
                "role": "admin",
                "resource": "driver",
                "action": "update:any",
                "attributes": "*"
            },
            {
                "role": "admin",
                "resource": "driver",
                "action": "read:any",
                "attributes": "*"
            },
            {
                "role": "admin",
                "resource": "driver",
                "action": "delete:any",
                "attributes": "*"
            },
            {
                "role": "admin",
                "resource": "truck",
                "action": "create:any",
                "attributes": "*"
            },
            {
                "role": "admin",
                "resource": "truck",
                "action": "update:any",
                "attributes": "*"
            },
            {
                "role": "admin",
                "resource": "truck",
                "action": "read:any",
                "attributes": "*"
            },
            {
                "role": "admin",
                "resource": "truck",
                "action": "delete:any",
                "attributes": "*"
            },
            {
                "role": "admin",
                "resource": "filterTruck",
                "action": "read:any",
                "attributes": "*"
            },
            {
                "role": "admin",
                "resource": "countries",
                "action": "read:any",
                "attributes": "*"
            },
            {
                "role": "admin",
                "resource": "states",
                "action": "read:any",
                "attributes": "*"
            },
            {
                "role": "admin",
                "resource": "truckTypes",
                "action": "read:any",
                "attributes": "*"
            },
            {
                "role": "admin",
                "resource": "boxTruckTypes",
                "action": "read:any",
                "attributes": "*"
            },
            {
                "role": "admin",
                "resource": "truckStatusAndLocation",
                "action": "update:any",
                "attributes": "*"
            },
            {
                "role": "admin",
                "resource": "user",
                "action": "create:any",
                "attributes": "*"
            },
            {
                "role": "admin",
                "resource": "user",
                "action": "update:any",
                "attributes": "*"
            },
            {
                "role": "admin",
                "resource": "user",
                "action": "read:any",
                "attributes": "*"
            },
            {
                "role": "admin",
                "resource": "user",
                "action": "delete:any",
                "attributes": "*"
            },
            {
                "role": "admin",
                "resource": "image",
                "action": "create:any",
                "attributes": "*"
            },
            {
                "role": "hr",
                "resource": "user",
                "action": "create:any",
                "attributes": "*"
            },
            {
                "role": "hr",
                "resource": "user",
                "action": "update:any",
                "attributes": "*"
            },
            {
                "role": "hr",
                "resource": "user",
                "action": "read:any",
                "attributes": "*"
            },
            {
                "role": "hr",
                "resource": "image",
                "action": "create:any",
                "attributes": "*"
            },

            {
                "role": "hr",
                "resource": "truck",
                "action": "create:any",
                "attributes": "*"
            },
            {
                "role": "hr",
                "resource": "truck",
                "action": "update:any",
                "attributes": "*"
            },
            {
                "role": "hr",
                "resource": "truck",
                "action": "read:any",
                "attributes": "*"
            },
            {
                "role": "hr",
                "resource": "filterTruck",
                "action": "read:any",
                "attributes": "*"
            },
            {
                "role": "hr",
                "resource": "countries",
                "action": "read:any",
                "attributes": "*"
            },
            {
                "role": "hr",
                "resource": "states",
                "action": "read:any",
                "attributes": "*"
            },
            {
                "role": "hr",
                "resource": "truckTypes",
                "action": "read:any",
                "attributes": "*"
            },
            {
                "role": "hr",
                "resource": "boxTruckTypes",
                "action": "read:any",
                "attributes": "*"
            },
            {
                "role": "hr",
                "resource": "driver",
                "action": "create:any",
                "attributes": "*"
            },
            {
                "role": "hr",
                "resource": "driver",
                "action": "update:any",
                "attributes": "*"
            },
            {
                "role": "hr",
                "resource": "driver",
                "action": "read:any",
                "attributes": "*"
            },

            {
                "role": "dispatcher",
                "resource": "driver",
                "action": "read:any",
                "attributes": "*"
            },
            {
                "role": "dispatcher",
                "resource": "truck",
                "action": "read:any",
                "attributes": "*"
            },
            {
                "role": "dispatcher",
                "resource": "filterTruck",
                "action": "read:any",
                "attributes": "*"
            },
            {
                "role": "dispatcher",
                "resource": "countries",
                "action": "read:any",
                "attributes": "*"
            },
            {
                "role": "dispatcher",
                "resource": "states",
                "action": "read:any",
                "attributes": "*"
            },
            {
                "role": "dispatcher",
                "resource": "truckTypes",
                "action": "read:any",
                "attributes": "*"
            },
            {
                "role": "dispatcher",
                "resource": "boxTruckTypes",
                "action": "read:any",
                "attributes": "*"
            },
            {
                "role": "dispatcher",
                "resource": "truckStatusAndLocation",
                "action": "update:any",
                "attributes": "*"
            }
        ],
        "status": true
    }
)

db.getCollection('adminpermissions').insertMany([
    {
        role: "admin",
        description: "",
        module: "driver",
        permit: ['create:any', 'update:any', 'read:any', 'delete:any']
    },
    {
        role: "admin",
        description: "",
        module: "truck",
        permit: ['create:any', 'update:any', 'read:any', 'delete:any']
    },
    {
        role: "admin",
        description: "",
        module: "filterTruck",
        permit: ['read:any']
    },
    {
        role: "admin",
        description: "",
        module: "countries",
        permit: ['read:any']
    },
    {
        role: "admin",
        description: "",
        module: "states",
        permit: ['read:any']
    },
    {
        role: "admin",
        description: "",
        module: "truckTypes",
        permit: ['read:any']
    },
    {
        role: "admin",
        description: "",
        module: "boxTruckTypes",
        permit: ['read:any']
    },
    {
        role: "admin",
        description: "",
        module: "truckStatusAndLocation",
        permit: ['update:any']
    },
    {
        role: "admin",
        description: "",
        module: "user",
        permit: ['create:any', 'update:any', 'read:any', 'delete:any']
    },
    {
        role: "admin",
        description: "",
        module: "image",
        permit: ['create:any']
    },
    {
        role: "dispatcher",
        description: "",
        module: "driver",
        permit: ['read:any']
    },
    {
        role: "dispatcher",
        description: "",
        module: "truck",
        permit: ['read:any']
    },
    {
        role: "dispatcher",
        description: "",
        module: "filterTruck",
        permit: ['read:any']
    },
    {
        role: "dispatcher",
        description: "",
        module: "countries",
        permit: ['read:any']
    },
    {
        role: "dispatcher",
        description: "",
        module: "states",
        permit: ['read:any']
    },
    {
        role: "dispatcher",
        description: "",
        module: "truckTypes",
        permit: ['read:any']
    },
    {
        role: "dispatcher",
        description: "",
        module: "boxTruckTypes",
        permit: ['read:any']
    },
    {
        role: "dispatcher",
        description: "",
        module: "truckStatusAndLocation",
        permit: ['update:any']
    },
    {
        role: "hr",
        description: "",
        module: "user",
        permit: ['create:any', 'update:any', 'read:any']
    },
    {
        role: "hr",
        description: "",
        module: "driver",
        permit: ['create:any', 'update:any', 'read:any']
    },
    {
        role: "hr",
        description: "",
        module: "truck",
        permit: ['create:any', 'update:any', 'read:any']
    },
    {
        role: "hr",
        description: "",
        module: "filterTruck",
        permit: ['read:any']
    },
    {
        role: "hr",
        description: "",
        module: "countries",
        permit: ['read:any']
    },
    {
        role: "hr",
        description: "",
        module: "states",
        permit: ['read:any']
    },
    {
        role: "hr",
        description: "",
        module: "truckTypes",
        permit: ['read:any']
    },
    {
        role: "hr",
        description: "",
        module: "boxTruckTypes",
        permit: ['read:any']
    },

])


db.boxtrucktypes.insertMany([
    {
        title: '14',
        description: '14'
    },
    {
        title: '16',
        description: '16'
    },

    {
        title: '18',
        description: '18'
    },
    {
        title: '20',
        description: '20'
    },
    {
        title: '22',
        description: '22'
    }, 
    {
        title: '24',
        description: '24'
    },
    {
        title: '26',
        description: '26'
    },
])