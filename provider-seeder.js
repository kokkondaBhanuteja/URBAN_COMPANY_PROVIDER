const axios = require('axios');

// The API endpoint for user registration
const API_URL = 'http://localhost:3000/api/auth/register';

// A comprehensive list of 30 providers with diverse skills and schedules
const providersToRegister = [
    // --- Appliance Repair (4 Providers) ---
    {
        userName: "Suresh Gupta",
        email: "suresh.ac@example.com",
        password: "password123",
        mobileNumber: "9871110001",
        userType: "provider",
        bio: "Certified technician for AC, refrigerator, and washing machine repairs. 10+ years of experience in Hanamkonda.",
        servicesOffered: ["68bdb0b954f8cc4546840466", "68bdb0b954f8cc4546840464", "68bdb0b954f8cc4546840468", "68bdb0b954f8cc454684046c"],
        serviceableLocations: ["Hanamkonda", "Waddepally"],
        availability: [{ startTime: "2025-09-08T04:00:00.000Z", endTime: "2025-09-08T14:00:00.000Z" }]
    },
    {
        userName: "Kavita Singh",
        email: "kavita.repair@example.com",
        password: "password123",
        mobileNumber: "9871110002",
        userType: "provider",
        bio: "Specializing in kitchen appliance repairs, including microwaves and refrigerators. Quick and reliable service.",
        servicesOffered: ["68bdb0b954f8cc454684046a", "68bdb0b954f8cc454684046e", "68bdb0b954f8cc4546840470"],
        serviceableLocations: ["Kazipet"],
        availability: [{ startTime: "2025-09-09T05:30:00.000Z", endTime: "2025-09-09T12:30:00.000Z" }]
    },
    {
        userName: "Ramesh Pawar",
        email: "ramesh.service@example.com",
        password: "password123",
        mobileNumber: "9871110003",
        userType: "provider",
        bio: "All major brand appliance repairs. Available on weekends for your convenience.",
        servicesOffered: ["68bdb0b954f8cc454684046c", "68bdb0b954f8cc4546840472"],
        serviceableLocations: ["Hanamkonda", "Kazipet", "Warangal"],
        availability: [{ startTime: "2025-09-13T03:00:00.000Z", endTime: "2025-09-14T15:00:00.000Z" }]
    },
    {
        userName: "Prakash Rao",
        email: "prakash.tech@example.com",
        password: "password123",
        mobileNumber: "9871110004",
        userType: "provider",
        bio: "Efficient and affordable repairs for washing machines and AC units.",
        servicesOffered: ["68bdb0b954f8cc4546840468", "68bdb0b954f8cc4546840472", "68bdb0b954f8cc4546840466"],
        serviceableLocations: ["Warangal"],
        availability: [{ startTime: "2025-09-10T06:00:00.000Z", endTime: "2025-09-10T15:00:00.000Z" }]
    },

    // --- Plumbing (4 Providers) ---
    {
        userName: "Arjun Reddy",
        email: "arjun.plumber@example.com",
        password: "password123",
        mobileNumber: "9872220001",
        userType: "provider",
        bio: "24/7 emergency plumbing services. Leaky faucets, drain cleaning, and installations.",
        servicesOffered: ["68bdb0b954f8cc4546840474", "68bdb0b954f8cc4546840478", "68bdb0b954f8cc454684047c", "68bdb0b954f8cc4546840482"],
        serviceableLocations: ["Hanamkonda", "Kazipet", "Warangal"],
        availability: [{ startTime: "2025-09-08T00:00:00.000Z", endTime: "2025-09-15T23:59:59.000Z" }]
    },
    {
        userName: "Bhavana Joshi",
        email: "bhavana.pipes@example.com",
        password: "password123",
        mobileNumber: "9872220002",
        userType: "provider",
        bio: "Expert in new toilet and fixture installations. Clean and professional work guaranteed.",
        servicesOffered: ["68bdb0b954f8cc4546840476", "68bdb0b954f8cc454684047e"],
        serviceableLocations: ["Hanamkonda"],
        availability: [{ startTime: "2025-09-09T05:00:00.000Z", endTime: "2025-09-09T13:00:00.000Z" }]
    },
    {
        userName: "Chandra Mohan",
        email: "chandra.flow@example.com",
        password: "password123",
        mobileNumber: "9872220003",
        userType: "provider",
        bio: "Specialist in drain cleaning and fixing major blockages.",
        servicesOffered: ["68bdb0b954f8cc4546840478", "68bdb0b954f8cc454684047c", "68bdb0b954f8cc4546840482"],
        serviceableLocations: ["Warangal"],
        availability: [{ startTime: "2025-09-11T04:30:00.000Z", endTime: "2025-09-11T11:30:00.000Z" }]
    },
    {
        userName: "Deepak Kumar",
        email: "deepak.plumbing@example.com",
        password: "password123",
        mobileNumber: "9872220004",
        userType: "provider",
        bio: "General plumbing maintenance and repair services for homes and offices.",
        servicesOffered: ["68bdb0b954f8cc4546840474", "68bdb0b954f8cc454684047a", "68bdb0b954f8cc4546840480"],
        serviceableLocations: ["Kazipet", "Warangal"],
        availability: [{ startTime: "2025-09-10T05:00:00.000Z", endTime: "2025-09-12T13:00:00.000Z" }]
    },

    // --- Electrician Services (4 Providers) ---
    {
        userName: "Eshwar Prasad",
        email: "eshwar.electric@example.com",
        password: "password123",
        mobileNumber: "9873330001",
        userType: "provider",
        bio: "Licensed electrician for all wiring, fixture, and fan installations. Safety is my top priority.",
        servicesOffered: ["68bdb0b954f8cc4546840484", "68bdb0b954f8cc4546840488", "68bdb0b954f8cc45468404e6"],
        serviceableLocations: ["Hanamkonda"],
        availability: [{ startTime: "2025-09-08T06:00:00.000Z", endTime: "2025-09-08T15:00:00.000Z" }]
    },
    {
        userName: "Farida Begum",
        email: "farida.lights@example.com",
        password: "password123",
        mobileNumber: "9873330002",
        userType: "provider",
        bio: "Creative light fixture installations and repairs to brighten up your space.",
        servicesOffered: ["68bdb0b954f8cc454684048e", "68bdb0b954f8cc4546840492"],
        serviceableLocations: ["Hanamkonda", "Waddepally"],
        availability: [{ startTime: "2025-09-11T07:00:00.000Z", endTime: "2025-09-11T14:00:00.000Z" }]
    },
    {
        userName: "Ganesh Varma",
        email: "ganesh.wiring@example.com",
        password: "password123",
        mobileNumber: "9873330003",
        userType: "provider",
        bio: "Full home wiring inspections and fan installations. Serving all of Hanamkonda.",
        servicesOffered: ["68bdb0b954f8cc4546840488", "68bdb0b954f8cc45468404e8", "68bdb0b954f8cc454684048c", "68bdb0b954f8cc4546840490"],
        serviceableLocations: ["Hanamkonda", "Kazipet", "Warangal"],
        availability: [{ startTime: "2025-09-09T04:00:00.000Z", endTime: "2025-09-10T14:00:00.000Z" }]
    },
    {
        userName: "Hari Babu",
        email: "hari.electrician@example.com",
        password: "password123",
        mobileNumber: "9873330004",
        userType: "provider",
        bio: "Quick and reliable repairs for all electrical issues.",
        servicesOffered: ["68bdb0b954f8cc454684048e", "68bdb0b954f8cc45468404e6"],
        serviceableLocations: ["Kazipet"],
        availability: [{ startTime: "2025-09-12T05:30:00.000Z", endTime: "2025-09-12T13:30:00.000Z" }]
    },
    
    // --- Carpentry (3 Providers) ---
    {
        userName: "Imran Khan",
        email: "imran.carpenter@example.com",
        password: "password123",
        mobileNumber: "9874440001",
        userType: "provider",
        bio: "Skilled carpenter for furniture assembly, door repairs, and custom shelving.",
        servicesOffered: ["68bdb0b954f8cc4546840494", "68bdb0b954f8cc4546840496", "68bdb0b954f8cc4546840498", "68bdb0b954f8cc454684049a", "68bdb0b954f8cc454684049c"],
        serviceableLocations: ["Hanamkonda", "Waddepally"],
        availability: [{ startTime: "2025-09-08T05:00:00.000Z", endTime: "2025-09-09T15:00:00.000Z" }]
    },
    {
        userName: "John David",
        email: "john.woodworks@example.com",
        password: "password123",
        mobileNumber: "9874440002",
        userType: "provider",
        bio: "Precision carpentry for door repairs and custom furniture.",
        servicesOffered: ["68bdb0b954f8cc4546840496", "68bdb0b954f8cc454684049e", "68bdb0b954f8cc45468404a4"],
        serviceableLocations: ["Kazipet"],
        availability: [{ startTime: "2025-09-10T06:00:00.000Z", endTime: "2025-09-10T14:00:00.000Z" }]
    },
    {
        userName: "Kiran Kumar",
        email: "kiran.furniture@example.com",
        password: "password123",
        mobileNumber: "9874440003",
        userType: "provider",
        bio: "Fast and efficient furniture assembly services.",
        servicesOffered: ["68bdb0b954f8cc4546840494", "68bdb0b954f8cc454684049c", "68bdb0b954f8cc45468404a0"],
        serviceableLocations: ["Hanamkonda", "Kazipet"],
        availability: [{ startTime: "2025-09-13T05:00:00.000Z", endTime: "2025-09-14T12:00:00.000Z" }]
    },

    // --- Painting (3 Providers) ---
    {
        userName: "Lalitha Kumari",
        email: "lalitha.paints@example.com",
        password: "password123",
        mobileNumber: "9875550001",
        userType: "provider",
        bio: "Professional painter for interior and exterior walls. I bring a keen eye for detail and color.",
        servicesOffered: ["68bdb0b954f8cc45468404a2", "68bdb0b954f8cc45468404a6", "68bdb0b954f8cc45468404aa", "68bdb0b954f8cc45468404ac"],
        serviceableLocations: ["Hanamkonda", "Warangal"],
        availability: [{ startTime: "2025-09-15T04:00:00.000Z", endTime: "2025-09-19T13:00:00.000Z" }]
    },
    {
        userName: "Murali Krishna",
        email: "murali.painter@example.com",
        password: "password123",
        mobileNumber: "9875550002",
        userType: "provider",
        bio: "Specializing in furniture painting and finishing.",
        servicesOffered: ["68bdb0b954f8cc45468404a8", "68bdb0b954f8cc45468404b2"],
        serviceableLocations: ["Kazipet"],
        availability: [{ startTime: "2025-09-10T07:00:00.000Z", endTime: "2025-09-10T16:00:00.000Z" }]
    },
    {
        userName: "Naveen Painters",
        email: "naveen.walls@example.com",
        password: "password123",
        mobileNumber: "9875550003",
        userType: "provider",
        bio: "A team of painters available for large exterior and interior projects.",
        servicesOffered: ["68bdb0b954f8cc45468404a2", "68bdb0b954f8cc45468404a6", "68bdb0b954f8cc45468404ae", "68bdb0b954f8cc45468404b0"],
        serviceableLocations: ["Hanamkonda", "Kazipet", "Warangal"],
        availability: [{ startTime: "2025-09-22T04:00:00.000Z", endTime: "2025-09-26T14:00:00.000Z" }]
    },

    // --- Pest Control (2 Providers) ---
    {
        userName: "Om Prakash",
        email: "om.pestcontrol@example.com",
        password: "password123",
        mobileNumber: "9876660001",
        userType: "provider",
        bio: "Eco-friendly and effective pest control for termites, bed bugs, and general pests.",
        servicesOffered: ["68bdb0b954f8cc45468404b4", "68bdb0b954f8cc45468404b6", "68bdb0b954f8cc45468404b8"],
        serviceableLocations: ["Hanamkonda", "Warangal"],
        availability: [{ startTime: "2025-09-08T08:00:00.000Z", endTime: "2025-09-08T16:00:00.000Z" }]
    },
    {
        userName: "Pest Busters HNK",
        email: "pestbusters@example.com",
        password: "password123",
        mobileNumber: "9876660002",
        userType: "provider",
        bio: "Your local pest control experts. We handle all kinds of infestations, big or small.",
        servicesOffered: ["68bdb0b954f8cc45468404ba", "68bdb0b954f8cc45468404bc", "68bdb0b954f8cc45468404be", "68bdb0b954f8cc45468404c0", "68bdb0b954f8cc45468404c2"],
        serviceableLocations: ["Hanamkonda", "Kazipet"],
        availability: [{ startTime: "2025-09-09T09:00:00.000Z", endTime: "2025-09-09T17:00:00.000Z" }, { startTime: "2025-09-11T09:00:00.000Z", endTime: "2025-09-11T17:00:00.000Z", isUnavailable: true }]
    },

    // --- Car Wash (2 Providers) ---
    {
        userName: "Quick Clean Carz",
        email: "carwash.qcc@example.com",
        password: "password123",
        mobileNumber: "9877770001",
        userType: "provider",
        bio: "Mobile car wash service. We come to you! Full service spa, interior, and exterior cleaning.",
        servicesOffered: ["68bdb0b954f8cc45468404c4", "68bdb0b954f8cc45468404c6", "68bdb0b954f8cc45468404c8"],
        serviceableLocations: ["Warangal"],
        availability: [{ startTime: "2025-09-13T04:00:00.000Z", endTime: "2025-09-14T14:00:00.000Z" }]
    },
    {
        userName: "Raju's Detailing",
        email: "raju.detail@example.com",
        password: "password123",
        mobileNumber: "9877770002",
        userType: "provider",
        bio: "Passionate about making cars shine. Specializing in deep interior detailing and exterior polishing.",
        servicesOffered: ["68bdb0b954f8cc45468404c6", "68bdb0b954f8cc45468404ce", "68bdb0b954f8cc45468404d2"],
        serviceableLocations: ["Hanamkonda", "Kazipet"],
        availability: [{ startTime: "2025-09-10T06:00:00.000Z", endTime: "2025-09-10T12:00:00.000Z" }]
    },

    // --- Home Tutoring (2 Providers) ---
    {
        userName: "Sarita Devi",
        email: "sarita.tutor@example.com",
        password: "password123",
        mobileNumber: "9878880001",
        userType: "provider",
        bio: "Experienced teacher offering tutoring in Math and Science for students up to 10th grade.",
        servicesOffered: ["68bdb0b954f8cc45468404d4", "68bdb0b954f8cc45468404d6", "68bdb0b954f8cc45468404da", "68bdb0b954f8cc45468404dc"],
        serviceableLocations: ["Hanamkonda"],
        availability: [{ startTime: "2025-09-08T11:30:00.000Z", endTime: "2025-09-08T14:30:00.000Z" }, { startTime: "2025-09-09T11:30:00.000Z", endTime: "2025-09-09T14:30:00.000Z" }]
    },
    {
        userName: "Tutor Academics",
        email: "tutor.academics@example.com",
        password: "password123",
        mobileNumber: "9878880002",
        userType: "provider",
        bio: "A group of tutors providing expert guidance in Math, Science, and English.",
        servicesOffered: ["68bdb0b954f8cc45468404d4", "68bdb0b954f8cc45468404d6", "68bdb0b954f8cc45468404d8", "68bdb0b954f8cc45468404de", "68bdb0b954f8cc45468404e0", "68bdb0b954f8cc45468404e2"],
        serviceableLocations: ["Kazipet", "Warangal"],
        availability: [{ startTime: "2025-09-15T10:30:00.000Z", endTime: "2025-09-19T15:30:00.000Z" }]
    },

    // --- Home Cleaning (3 Providers) ---
    {
        userName: "Uma Maids",
        email: "uma.maids@example.com",
        password: "password123",
        mobileNumber: "9879990001",
        userType: "provider",
        bio: "Reliable and trustworthy home cleaning services. We offer deep cleaning, bathroom, and kitchen packages.",
        servicesOffered: ["68bdb0b954f8cc454684044c", "68bdb0b954f8cc4546840486", "68bdb0b954f8cc45468404e4"],
        serviceableLocations: ["Hanamkonda"],
        availability: [{ startTime: "2025-09-08T04:30:00.000Z", endTime: "2025-09-08T10:30:00.000Z" }]
    },
    {
        userName: "Vijay Cleaners",
        email: "vijay.cleaners@example.com",
        password: "password123",
        mobileNumber: "9879990002",
        userType: "provider",
        bio: "Specialists in sofa and upholstery cleaning. We make your furniture look new again.",
        servicesOffered: ["68bdb0b954f8cc4546840450", "68bdb0b954f8cc4546840452"],
        serviceableLocations: ["Warangal"],
        availability: [{ startTime: "2025-09-10T05:00:00.000Z", endTime: "2025-09-10T11:00:00.000Z" }]
    },
    {
        userName: "Warangal Cleaning Crew",
        email: "wgl.crew@example.com",
        password: "password123",
        mobileNumber: "9879990003",
        userType: "provider",
        bio: "Your one-stop solution for all home cleaning needs in the Warangal area.",
        servicesOffered: ["68bdb0b954f8cc454684044c", "68bdb0b954f8cc4546840450", "68bdb0b954f8cc454684048a", "68bdb0b954f8cc45468404e4"],
        serviceableLocations: ["Hanamkonda", "Kazipet", "Warangal"],
        availability: [{ startTime: "2025-09-12T04:00:00.000Z", endTime: "2025-09-12T12:00:00.000Z" }]
    },

    // --- Salon for Women (3 Providers) ---
    {
        userName: "Zara Beauty",
        email: "zara.beauty@example.com",
        password: "password123",
        mobileNumber: "9870001111",
        userType: "provider",
        bio: "Luxury salon services at home. Specializing in facials, manicures, and pedicures.",
        servicesOffered: ["68bdb0b954f8cc454684045e", "68bdb0b954f8cc4546840456", "68bdb0b954f8cc4546840458", "68bdb0b954f8cc4546840460", "68bdb0b954f8cc4546840462"],
        serviceableLocations: ["Hanamkonda"],
        availability: [{ startTime: "2025-09-11T06:30:00.000Z", endTime: "2025-09-11T13:30:00.000Z" }]
    },
    {
        userName: "Anita's Styles",
        email: "anita.styles@example.com",
        password: "password123",
        mobileNumber: "9870001112",
        userType: "provider",
        bio: "Expert haircuts and waxing services provided in the comfort of your own home.",
        servicesOffered: ["68bdb0b954f8cc4546840454", "68bdb0b954f8cc454684045a", "68bdb0b954f8cc454684045c"],
        serviceableLocations: ["Kazipet", "Warangal"],
        availability: [{ startTime: "2025-09-13T07:00:00.000Z", endTime: "2025-09-13T15:00:00.000Z" }]
    },
    {
        userName: "Glam Up HNK",
        email: "glamup.hnk@example.com",
        password: "password123",
        mobileNumber: "9870001113",
        userType: "provider",
        bio: "Complete salon for women. We offer all beauty services from head to toe.",
        servicesOffered: ["68bdb0b954f8cc4546840454", "68bdb0b954f8cc4546840456", "68bdb0b954f8cc4546840458", "68bdb0b954f8cc454684045a", "68bdb0b954f8cc454684045e"],
        serviceableLocations: ["Hanamkonda", "Warangal"],
        availability: [{ startTime: "2025-09-09T08:00:00.000Z", endTime: "2025-09-10T16:00:00.000Z" }]
    }
];

/**
 * The main function to send the registration requests.
 */
const seedDatabase = async () => {
  console.log(`🚀 Starting to seed ${providersToRegister.length} provider data...`);

  for (const providerData of providersToRegister) {
    try {
      console.log(`\nAttempting to register: ${providerData.userName} (${providerData.email})...`);
      
      const response = await axios.post(API_URL, providerData);

      console.log(`✅ Success! User '${providerData.userName}' registered. Response status: ${response.status}`);
    } catch (error) {
      console.error(`❌ Failed to register '${providerData.userName}'.`);
      if (error.response) {
        // The server responded with a status code that falls out of the range of 2xx
        console.error(`   Error Status: ${error.response.status}`);
        console.error(`   Error Data: ${JSON.stringify(error.response.data, null, 2)}`);
      } else if (error.request) {
        // The request was made but no response was received
        console.error("   No response received from the server. Is your application running at " + API_URL + "?");
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('   Error in request setup:', error.message);
      }
    }
  }

  console.log("\nSeeding process finished.");
};

// Run the seeding function
seedDatabase();

