const { Pool } = require('pg');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'smart_faculty',
    password: process.env.DB_PASSWORD || 'password',
    port: process.env.DB_PORT || 5432,
    ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('sslmode=require') ? { rejectUnauthorized: false } : false
});

// Real Computer Science Faculty Data
const csFaculty = [
    { room: "CS A – 105", short: "Dr. PH", name: "Dr. Pavithra H", spec: "SDN, Software Engineering", floor: "1st Floor" },
    { room: "CS A – 104", short: "Dr. PSB", name: "Dr. Prapulla S B", spec: "Computer Networks, WSN", floor: "1st Floor" },
    { room: "CS A – 103", short: "Dr. HR", name: "Dr. Hemavathy R", spec: "Image Processing", floor: "1st Floor" },
    { room: "CS A – 102", short: "Dr. RS", name: "Dr. Rajashree Shettar", spec: "Information Retrieval, Data Mining", floor: "1st Floor" },
    { room: "CS A – 101", short: "Dr. MM", name: "Dr. Minal Moharir", spec: "High Performance Computing, Networks & Information Security", floor: "1st Floor" },
    { room: "CS A – 106", short: "Dr. CRM", name: "Dr. Chethana R Murthy", spec: "Wireless Cellular Networks", floor: "1st Floor" },
    { room: "CS A – 107", short: "Dr. VG", name: "Dr. Veena Gadad", spec: "Data Security & Privacy", floor: "1st Floor" },
    { room: "CS A – 108", short: "Mrs. KCG", name: "Prof. Ganashree K C", spec: "Image Processing, Algorithms", floor: "1st Floor" },
    { room: "CS A – 109", short: "Mrs. AUC", name: "Prof. Apoorva Udaya Kumar Chate", spec: "Machine Learning", floor: "1st Floor" },
    { room: "CS A – 110", short: "Dr. RMP", name: "Dr. Ramakanth Kumar P", spec: "Pattern Recognition, NLP", floor: "1st Floor" },
    { room: "CS A – 113", short: "Dr. SNM", name: "Dr. Sneha M", spec: "Network Security", floor: "1st Floor" },
    { room: "CS A – 114", short: "Dr. NSK", name: "Prof. Neethu S", spec: "SDN, Machine Learning, Embedded Systems", floor: "1st Floor" },
    { room: "CS A – 205", short: "Dr. SB", name: "Dr. Suma B", spec: "Data Mining, Image Processing", floor: "2nd Floor" },
    { room: "CS A – 204", short: "Dr. JS", name: "Dr. Jyoti Shetty", spec: "Virtualization, Cloud Computing", floor: "2nd Floor" },
    { room: "CS A – 203", short: "Dr. SCN", name: "Dr. Sowmyarani C N", spec: "Computer Security & Privacy", floor: "2nd Floor" },
    { room: "CS A – 202", short: "Dr. DN", name: "Dr. Deepamala N", spec: "NLP, Computer Networks", floor: "2nd Floor" },
    { room: "CS A – 201", short: "Dr. AS", name: "Dr. Anitha Sandeep", spec: "Information Security", floor: "2nd Floor" },
    { room: "CS A – 206", short: "Mrs. DD", name: "Prof. Deepika Dash", spec: "Compiler Design", floor: "2nd Floor" },
    { room: "CS A – 207", short: "Dr. ASP", name: "Dr. Anitha Sandeep", spec: "Information Security", floor: "2nd Floor" },
    { room: "CS A – 208", short: "Dr. SDV", name: "Dr. Sindhu D V", spec: "NLP, Speech Processing, Neural Networks", floor: "2nd Floor" },
    { room: "CS A – 209", short: "Mr. SHD", name: "Prof. Shraddha H D", spec: "Computer Science and Engineering", floor: "2nd Floor" },
    { room: "CS A – 210", short: "Dr. AN", name: "Dr. Azra Nasreen", spec: "Video Analytics", floor: "2nd Floor" },
    { room: "CS A – 211", short: "Dr. TP", name: "Dr. Praveena T", spec: "Computer Networks", floor: "2nd Floor" },
    { room: "CS A – 214", short: "Dr. MSS", name: "Dr. Smriti Srivastava", spec: "Wireless Mesh Networks", floor: "2nd Floor" },
    { room: "CS A – 215", short: "Dr. SMS", name: "Dr. Srividya M S", spec: "Computer Vision, Deep Learning, Machine Learning", floor: "2nd Floor" },
    { room: "CS A – 307", short: "Dr. MMN", name: "Dr. Manas M N", spec: "Data Mining", floor: "3rd Floor" },
    { room: "CS A – 306", short: "Dr. KB", name: "Dr. K Badari Nath", spec: "Embedded Systems", floor: "3rd Floor" },
    { room: "CS A – 305", short: "Dr. ARA", name: "Dr. Ashok Kumar", spec: "Video Analytics", floor: "3rd Floor" },
    { room: "CS A – 304", short: "Dr. MH", name: "Dr. Mohana", spec: "Quantum ML, GenAI, Deep Learning, Computer Vision", floor: "3rd Floor" },
    { room: "CS A – 303", short: "Dr. VH", name: "Dr. Vinay Hegde", spec: "NLP, Networks", floor: "3rd Floor" },
    { room: "CS A – 302", short: "Dr. HKK", name: "Dr. Krishnappa H K", spec: "Graph Theory, Graphics", floor: "3rd Floor" },
    { room: "CS A – 301", short: "Dr. GSN", name: "Dr. G S Nagaraja", spec: "Computer Networks, Network Management", floor: "3rd Floor" },
    { room: "CS A – 308", short: "Dr. KSK", name: "Dr. Karanam Sunil Kumar", spec: "Computer Vision, Machine Learning", floor: "3rd Floor" },
    { room: "CS A – 309", short: "Mrs. LKC", name: "Prof. L Kala Chandrashekhar", spec: "AI, Machine Learning, Blockchain Technologies", floor: "3rd Floor" },
    { room: "CS A – 310", short: "Mrs. NGD", name: "Prof. Nithyashree G D", spec: "Data Structures", floor: "3rd Floor" },
    { room: "CS A – 312", short: "Mrs. KSK", name: "Prof. Savitri Kulkarni", spec: "Machine Learning, Deep Learning", floor: "3rd Floor" },
    { room: "CS A – 313", short: "Dr. RJ", name: "Prof. Rajatha", spec: "AI, Machine Learning", floor: "3rd Floor" },
    { room: "CS A – 314", short: "Dr. MVP", name: "Prof. Mekhala Vinod Purohit", spec: "AI, Deep Learning, Computer Vision", floor: "3rd Floor" },
    { room: "CS A – 315", short: "Mrs. SGD", name: "Prof. Saraswathi Govind Datar", spec: "AI & ML in Healthcare", floor: "3rd Floor" },
    { room: "CS A – 317", short: "Mrs. DL", name: "Prof. Deepthi L", spec: "Computer Networks", floor: "3rd Floor" },
    { room: "CS A – 322", short: "Dr. MS", name: "Dr. Manonmani S", spec: "Image Processing, Machine Learning, Deep Learning", floor: "3rd Floor" },
    { room: "CS A – 323", short: "Dr. SBP", name: "Prof. Shweta Babu Prasad", spec: "Computer Networks, Blockchain", floor: "3rd Floor" },
    { room: "CS A – 318", short: "Dr. TD", name: "Dr. Pratiba D", spec: "Web Technologies", floor: "3rd Floor" },
    { room: "CS A – 319", short: "Dr. SANS", name: "Dr. Sandhya S", spec: "Networks and Virtualization", floor: "3rd Floor" }
];

// Electronics & Communication (Electrical) Faculty Data
const eceFaculty = [
    { name: "Dr. K.S. Geetha", short: "KSG", spec: "Signal Processing, Image processing, Flexible Electronics" },
    { name: "Dr. Prakash Biswagar", short: "PB", spec: "Communication Systems" },
    { name: "Dr. M. Uttara Kumari", short: "MUK", spec: "Signal Processing" },
    { name: "Dr. Ramesh K B", short: "RKB", spec: "Signal Processing, Embedded System, Biomedical engineering" },
    { name: "Dr. Veena Devi S V", short: "VDSV", spec: "Image Processing & Signal Processing" },
    { name: "Dr. Govinda Raju M.", short: "GRM", spec: "Embedded systems, Multi Carrier Modulation Techniques" },
    { name: "Dr. Mahesh A.", short: "MA", spec: "Electromagnetics and Antennas" },
    { name: "Dr. Shilpa D.R.", short: "SDR", spec: "VLSI Design, ASIC Design" },
    { name: "Dr. Abhay .A. Deshpande", short: "AAD", spec: "Communication System, Robotics, Control System, Signal Processing" },
    { name: "Dr. Chethana G", short: "CG", spec: "Embedded systems, MIMO, AI/ML" },
    { name: "Dr. Sujata D. Badiger", short: "SDB", spec: "Wireless Communication and Networking" },
    { name: "Dr. Rohini S. Hallikar", short: "RSH", spec: "Communication Systems" },
    { name: "Dr. Sujatha Hiremath", short: "SH", spec: "VLSI Design" },
    { name: "Dr. Deepashree Devaraj", short: "DD", spec: "Medical image processing, Biomedical instrumentation" },
    { name: "Dr. Rajani Katiyar", short: "RK", spec: "Communication & Signal Processing" },
    { name: "Dr. K. A. Nethravathi", short: "KAN", spec: "RADAR Signal Processing & Wireless Communication" },
    { name: "Dr. Harsha", short: "H", spec: "Medical Image Processing" },
    { name: "Dr. Ramavenkateswaran.N.", short: "RVN", spec: "Electron device fabrication and characterization, Thin film transistors, Nanomaterials" },
    { name: "Dr. Roopa J.", short: "RJ", spec: "2D materials based thin film flexible sensors" },
    { name: "Dr. Rajasree. P. M", short: "RPM", spec: "Electronics and Communication" },
    { name: "P. Narashimaraja", short: "PN", spec: "Analog IC Design, Photonics" },
    { name: "Dr. Veena Divya. K", short: "VDK", spec: "Image Processing" },
    { name: "Ravishankar Holla", short: "RH", spec: "Sensors and sensor networks" },
    { name: "Dr. Sowmya Nag K", short: "SNK", spec: "Wireless Communication, Network Security" },
    { name: "Sujata Priyambada Mishra", short: "SPM", spec: "Signal Processing" },
    { name: "Neeta B.Malvi", short: "NBM", spec: "Signal processing, Image Processing and cryptography" },
    { name: "Deepika P", short: "DP", spec: "Low power VLSI design" },
    { name: "Shwetha Baliga", short: "SB", spec: "Signal processing" },
    { name: "Dr. Rajithkumar B K", short: "RBK", spec: "Image processing & Machine Learning" },
    { name: "Anusha L S", short: "ALS", spec: "Signal Processing, Image Processing" },
    { name: "S Praveen", short: "SP", spec: "Digital Electronics, Embedded System, VLSI Design" },
    { name: "Mrs Pratibha Kantanavar", short: "PK", spec: "Wireless Adhoc Networks" },
    { name: "Ms Sindhu Rajendran", short: "SR", spec: "Communication Systems, Networking" },
    { name: "Dr. Avik Banerjee", short: "AB", spec: "Wireless Communication, Cognitive radio Networks" },
    { name: "Dr. S Ravi Shankar", short: "SRS", spec: "Electromagnetic Scattering, Antennas, Broadband Communication" }
];

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const csCourses = ['CS101', 'CS202', 'DAA', 'OS', 'CN', 'AI/ML', 'DBMS', 'SE', 'Web Tech', 'Labs', 'Blockchain', 'NLP'];
const eceCourses = ['EC101', 'EC202', 'Signals', 'Analog', 'Digital', 'VLSI', 'Control Systems', 'Communication', 'Microcontrollers', 'DSP', 'Embedded Systems', 'Electromagnetics'];

const timeSlots = [
    { start: '09:00:00', end: '10:00:00' },
    { start: '10:00:00', end: '11:00:00' },
    // Break 11:00-11:30
    { start: '11:30:00', end: '12:30:00' },
    { start: '12:30:00', end: '13:30:00' },
    // Break 13:30-14:30
    { start: '14:30:00', end: '15:30:00' },
    { start: '15:30:00', end: '16:30:00' }
];

// Helper to generate dynamic, premium bios and research interest descriptions based on specializations
const getResearchAndBio = (spec, department) => {
    if (!spec) {
        return {
            interests: `General studies in ${department}, advanced algorithms, and academic education.`,
            bio: `Dedicated faculty member of the ${department} department, involved in core student mentoring and academic research.`
        };
    }

    const specLower = spec.toLowerCase();
    
    if (specLower.includes('network') || specLower.includes('sdn') || specLower.includes('wsn')) {
        return {
            interests: "Software-defined networking, routing protocols, wireless sensor networks, network simulation and overlay networks.",
            bio: "Experienced researcher focusing on high-speed communications, overlay network topologies, and energy-efficient routing protocols."
        };
    }
    if (specLower.includes('ai') || specLower.includes('artificial') || specLower.includes('learning') || specLower.includes('ml') || specLower.includes('intelligence') || specLower.includes('nlp') || specLower.includes('vision')) {
        return {
            interests: "Deep learning applications, neural networks, natural language processing, computer vision, and machine learning models.",
            bio: "Specializing in artificial intelligence, neural network optimization, and computer vision architectures with a focus on real-world applications."
        };
    }
    if (specLower.includes('data') || specLower.includes('mining') || specLower.includes('analytics') || specLower.includes('information retrieval')) {
        return {
            interests: "Big data analytics, data mining, predictive analytics, statistical inference, and large-scale visualization.",
            bio: "Academic specializing in big data engineering, data collection pipelines, and large-scale data visualization frameworks."
        };
    }
    if (specLower.includes('security') || specLower.includes('cryptography') || specLower.includes('privacy')) {
        return {
            interests: "Cryptography, network security intrusion detection, blockchain technology, vulnerability assessment, and privacy-preserving algorithms.",
            bio: "Security researcher focusing on decentralized ledgers, penetration testing, and zero-trust security architecture."
        };
    }
    if (specLower.includes('vlsi') || specLower.includes('asic') || specLower.includes('fabrication') || specLower.includes('transistor') || specLower.includes('device') || specLower.includes('analog') || specLower.includes('ic')) {
        return {
            interests: "VLSI design, ASIC design, electron device fabrication and characterization, thin-film transistors, and analog integrated circuits.",
            bio: "Researcher specializing in semiconductor devices, micro-electronics fabrication, and hardware-level design methodologies."
        };
    }
    if (specLower.includes('signal') || specLower.includes('image') || specLower.includes('video') || specLower.includes('speech')) {
        return {
            interests: "Signal processing, image processing, video analytics, speech processing, and multidimensional digital filter design.",
            bio: "Academic specializing in advanced signal processing algorithms, image enhancement, and computer-vision-based video parsing."
        };
    }
    if (specLower.includes('embedded') || specLower.includes('iot') || specLower.includes('sensor') || specLower.includes('robotics')) {
        return {
            interests: "Smart grid technologies, edge computing, embedded systems, IoT security protocols, robotics, and sensor networks.",
            bio: "Lab coordinator working on micro-controllers, smart campus projects, and hardware-software integration for IoT nodes."
        };
    }
    if (specLower.includes('cloud') || specLower.includes('virtualization')) {
        return {
            interests: "Virtualization, microservices architecture, serverless computing, cloud storage systems.",
            bio: "Researcher and developer focusing on cloud-native deployments, Kubernetes management, and distributed databases."
        };
    }
    if (specLower.includes('software') || specLower.includes('web') || specLower.includes('compiler')) {
        return {
            interests: "Agile methodologies, software architecture patterns, code quality metrics, automated testing, and web technologies.",
            bio: "Lecturer focusing on modern software engineering paradigms, automated CI/CD pipelines, and front-end design frameworks."
        };
    }

    return {
        interests: `Advanced research in ${spec}, system optimization, and emerging technologies.`,
        bio: `Dedicated faculty member specializing in ${spec} with a strong focus on undergraduate education and research.`
    };
};

const seed = async () => {
    try {
        console.log("Connecting to database...");

        // 1. Reset database tables using schema
        console.log("Applying Schema...");
        const schemaPath = path.join(__dirname, '../database/schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        await pool.query(schemaSql);
        console.log("Schema applied (tables reset).");

        // Clear table content completely just in case (schema SQL already drops them)
        await pool.query('DELETE FROM timetables');
        await pool.query('DELETE FROM users');
        await pool.query('DELETE FROM faculty');

        const insertedFaculties = [];

        // 2. Insert CS Faculty Data (44 members)
        console.log("Inserting CS Faculty...");
        for (const faculty of csFaculty) {
            const { interests, bio } = getResearchAndBio(faculty.spec, 'Computer Science');
            const res = await pool.query(
                'INSERT INTO faculty (name, department, room_number, floor_number, aliases, specialization, research_interests, bio) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
                [faculty.name, 'Computer Science', faculty.room, faculty.floor, [faculty.short], faculty.spec, interests, bio]
            );
            insertedFaculties.push({ id: res.rows[0].id, name: faculty.name, department: 'Computer Science' });
        }

        // 3. Insert ECE Faculty Data (35 members)
        console.log("Inserting ECE Faculty...");
        for (const faculty of eceFaculty) {
            const floor = Math.random() > 0.5 ? "2nd Floor" : "3rd Floor";
            const room = `EC-${Math.floor(Math.random() * 100) + 200}`;
            const { interests, bio } = getResearchAndBio(faculty.spec, 'Electronics and Communication');
            
            const res = await pool.query(
                'INSERT INTO faculty (name, department, room_number, floor_number, aliases, specialization, research_interests, bio) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
                [faculty.name, 'Electronics and Communication', room, floor, [faculty.short], faculty.spec, interests, bio]
            );
            insertedFaculties.push({ id: res.rows[0].id, name: faculty.name, department: 'Electronics and Communication' });
        }



        // 5. Generate Timetables
        console.log("Generating Faculty Timetables...");
        for (const f of insertedFaculties) {
            const coursesList = f.department === 'Computer Science' 
                ? csCourses 
                : eceCourses;

            for (const day of days) {
                let classesToday = 0;
                for (const slot of timeSlots) {
                    // 30% chance for a class, maximum of 3 classes per day
                    if (Math.random() < 0.3 && classesToday < 3) {
                        const course = coursesList[Math.floor(Math.random() * coursesList.length)];
                        await pool.query(
                            'INSERT INTO timetables (faculty_id, day_of_week, start_time, end_time, course_name) VALUES ($1, $2, $3, $4, $5)',
                            [f.id, day, slot.start, slot.end, course]
                        );
                        classesToday++;
                    }
                }
            }
        }

        console.log(`Seeding complete! Successfully seeded ${insertedFaculties.length} faculty members.`);
        process.exit(0);

    } catch (err) {
        console.error("Seeding failed:", err);
        process.exit(1);
    }
};

seed();
