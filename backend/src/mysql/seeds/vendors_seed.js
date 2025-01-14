exports.seed = function (knex) {
  // Deletes ALL existing entries
  return knex('vendors')
    .del()
    .then(function () {
      // Inserts seed entries
      return knex('vendors').insert([
        {
          vendor_name: 'Tech Supplies Inc.',
          contact_name: 'John Doe',
          address: '123 Tech Street',
          city: 'New York',
          postal_code: '10001',
          country: 'USA',
          phone: '+1 234-567-8901',
          status: '1', // Active
        },
        {
          vendor_name: 'Furniture World',
          contact_name: 'Jane Smith',
          address: '456 Furniture Avenue',
          city: 'Los Angeles',
          postal_code: '90001',
          country: 'USA',
          phone: '+1 234-567-8902',
          status: '1', // Active
        },
        {
          vendor_name: 'HomeTech Co.',
          contact_name: 'Sam Wilson',
          address: '789 HomeTech Blvd',
          city: 'Chicago',
          postal_code: '60001',
          country: 'USA',
          phone: '+1 234-567-8903',
          status: '1', // Active
        },
        {
          vendor_name: 'Books Unlimited',
          contact_name: 'Tom Brown',
          address: '321 Book Lane',
          city: 'Boston',
          postal_code: '02101',
          country: 'USA',
          phone: '+1 234-567-8904',
          status: '1', // Active
        },
        {
          vendor_name: 'Clothing Hub',
          contact_name: 'Sara Lee',
          address: '987 Fashion Street',
          city: 'Miami',
          postal_code: '33101',
          country: 'USA',
          phone: '+1 234-567-8905',
          status: '1', // Active
        },
        {
          vendor_name: 'Outdoor Adventures',
          contact_name: 'Peter Parker',
          address: '654 Adventure Drive',
          city: 'Denver',
          postal_code: '80201',
          country: 'USA',
          phone: '+1 234-567-8906',
          status: '2', // inActive
        },
        {
          vendor_name: 'Smart Home Gadgets',
          contact_name: 'Alice Johnson',
          address: '852 Smart Street',
          city: 'San Francisco',
          postal_code: '94101',
          country: 'USA',
          phone: '+1 234-567-8907',
          status: '1', // Active
        },
        {
          vendor_name: 'Automotive Solutions',
          contact_name: 'Bruce Wayne',
          address: '147 Car Lane',
          city: 'Detroit',
          postal_code: '48201',
          country: 'USA',
          phone: '+1 234-567-8908',
          status: '2', // inActive
        },
        {
          vendor_name: 'Kitchen Masters',
          contact_name: 'Clark Kent',
          address: '369 Kitchen Road',
          city: 'Seattle',
          postal_code: '98101',
          country: 'USA',
          phone: '+1 234-567-8909',
          status: '2', // inActive
        },
        {
          vendor_name: 'Beauty Essentials',
          contact_name: 'Diana Prince',
          address: '258 Beauty Way',
          city: 'Dallas',
          postal_code: '75201',
          country: 'USA',
          phone: '+1 234-567-8910',
          status: '1', // Active
        },
      ]);
    });
};
