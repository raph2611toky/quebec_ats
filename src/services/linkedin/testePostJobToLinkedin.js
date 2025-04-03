const postJobToLinkedin = require("./linkedin.services.js");

// async function testeJobPost() {
//     try {
//       const jobData = {
//         title: "Développeur Full Stack",
//         description: "Nous recherchons un développeur full stack pour rejoindre notre équipe dynamique.",
//         company: "Tech Innovators",
//         location: "Paris, France",
//         applyUrl: "https://www.example.com/postuler"
//       };
  
//       const jobPost = await postJobToLinkedin(jobData.title, jobData.description, jobData.company, jobData.location, jobData.applyUrl);
//       console.log("Job posted successfully:", jobPost);
//     } catch (error) {
//       console.error("Erreur lors de la publication de l'offre:", error);
//     }
//   }
  
//   testeJobPost();

const shareJobOnLinkedIn = require("./linkedin.services.js");

async function testeJobShare() {
    try {
        const jobData = {
            title: "Développeur Full Stack",
            description: "Nous recherchons un développeur full stack pour rejoindre notre équipe dynamique.",
            companyPageId: "482a39359", // Remplace par l'ID de ta page entreprise LinkedIn
            applyUrl: "https://www.example.com/postuler"
        };

        const jobPost = await shareJobOnLinkedIn(
            jobData.title, 
            jobData.description, 
            jobData.companyPageId, 
            jobData.applyUrl
        );

        console.log("Job shared successfully on LinkedIn feed:", jobPost);
    } catch (error) {
        console.error("Erreur lors du partage de l'offre:", error);
    }
}

testeJobShare();
