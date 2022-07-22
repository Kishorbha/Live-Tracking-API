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
                "resource": "trailerTypes",
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
                "resource": "user",
                "action": "delete:any",
                "attributes": "*"
            },
            {
                "role": "hr",
                "resource": "image",
                "action": "create:any",
                "attributes": "*"
            },

            {
                "role": "dispatcher",
                "resource": "driver",
                "action": "create:any",
                "attributes": "*"
            },
            {
                "role": "dispatcher",
                "resource": "driver",
                "action": "update:any",
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
                "resource": "driver",
                "action": "delete:any",
                "attributes": "*"
            },


            {
                "role": "dispatcher",
                "resource": "truck",
                "action": "create:any",
                "attributes": "*"
            },
            {
                "role": "dispatcher",
                "resource": "truck",
                "action": "update:any",
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
                "resource": "truck",
                "action": "delete:any",
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
                "resource": "trailerTypes",
                "action": "read:any",
                "attributes": "*"
            },
            {
                "role": "dispatcher",
                "resource": "truckStatusAndLocation",
                "action": "update:any",
                "attributes": "*"
            },


        ],
        "status": true
    }
)

  db.drivers.updateMany({isTruckAssociated:{$exists:false}}, { $set:{isTruckAssociated:true}})