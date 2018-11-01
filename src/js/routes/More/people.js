import webAppConfig from "../../config";
import { cordovaDot } from "../../utils/cordovaUtils";

if (window.cordova) {  // Static constants are initialized before the app starts
  webAppConfig.IS_CORDOVA = true;
}

const photoPath = cordovaDot("/img/global/photos/");

export const weVoteBoard = [ {
    name: "Lawrence Grodeska",
    image: photoPath + "Lawrence_Grodeska-200x200.jpg",
    title: [
      "c3 Board Chair",
      "Civic Tech communications and innovation at CivicMakers. Formerly at Change.org."
    ]
  }, {
    name: "Jenifer Fernandez Ancona",
    image: photoPath + "Jenifer_Fernandez_Ancona-200x200.jpg",
    title: [
      "Co-Founder",
      "VP, Strategy & Member Engagement at the Women Donors Network.",
    ],
  }, {
    name: "Debra Cleaver",
    image: photoPath + "Debra_Cleaver-200x200.jpg",
    title: [
      "c3 Board Member",
      "Founder & CEO of VOTE.org, the web's most heavily trafficked site for accurate voting information.",
    ],
  }, {
    name: "Tiana Epps-Johnson",
    image: photoPath + "Tiana_Epps_Johnson-200x200.jpg",
    title: [
      "Senior Adviser",
      "Exec. Dir. of CTCL, software for election administrators. Former Voting Info Project Harvard Ash Center for Democratic Governance and Innovation.",
    ],
  }, {
    name: "Dale John McGrew",
    image: photoPath + "Dale_McGrew-200x200.jpg",
    title: [
      "Co-Founder / CTO & c3 Board Member",
      "Managed large software projects for companies like Disney and over 60 nonprofits.",
    ],
  }, {
    name: "Alicia Kolar Prevost",
    image: photoPath + "Alicia_Prevost-200x200.jpg",
    title: [
      "Senior Adviser",
      "Led Defend Our Future (Environmental Defense Fund), mobilizing young people around climate action. PhD in political science, American University.",
    ],
  }, {
    name: "Barbara Shannon",
    image: photoPath + "Barbara_Shannon-200x200.jpg",
    title: [
      "c3 Board Member",
      "Adviser to entrepreneurs and C-level Fortune 500 leaders. MBA The Wharton School.",
    ],
  }, {
    name: "Betsy Sikma",
    image: photoPath + "Betsy_Sikma-200x200.jpg",
    title: [
      "c3 Board Member",
      "",
    ],
  }
];

export const weVoteStaff = [{
    name: "Dale John McGrew",
    image: photoPath + "Dale_McGrew-200x200.jpg",
    title: [
      "Executive Director / Co-Founder / CTO",
    ],
  }, {
    name: "Neil Dullaghan",
    image: photoPath + "Neil_Dullaghan-200x200.jpg",
    title: [
      "Political Data Manager",
    ],
  }, {
    name: "Irene Florez",
    image: photoPath + "Irene_Florez-200x200.jpg",
    title: [
      "Marketing Manager",
    ],
  }, {
    name: "Jeff French",
    image: photoPath + "Jeff_French-200x200.jpg",
    title: [
      "Lead Designer",
    ],
  }, {
    name: "Elizabeth Janeczko",
    image: photoPath + "Elizabeth_Janeczko-200x200.jpg",
    title: [
      "Sr. Writer & Content Marketing Manager",
    ],
  }, {
    name: "Judy Johnson",
    image: photoPath + "Judy_Johnson-200x200.jpg",
    title: [
      "Operations",
    ],
  }, {
    name: "Michael Kushman",
    image: photoPath + "Michael_Kushman-200x200.jpg",
    title: [
      "Product Marketing",
    ],
  }, {
    name: "Edward Ly",
    image: photoPath + "Edward_Ly-200x200.jpg",
    title: [
      "Engineering Intern",
    ],
  }, {
    name: "Steve Podell",
    image: photoPath + "Steve_Podell-200x200.jpg",
    title: [
      "Volunteer",
    ],
  }
];

export const organizationalDonors = [{
    name: "Amazon Web Services",
    title: "Servers",
  }, {
    name: "Ballotpedia",
    title: "Data",
  }, {
    name: "Center for Technology and Civic Life",
    title: "Data",
  }, {
    name: "Change.org",
    title: "Data",
  }, {
    name: "CivicMakers",
    title: "Event Collaborations",
  }, {
    name: "Code for San Francisco & Code for America",
    title: "Our Home for Volunteer Work",
  }, {
    name: "DLA Piper",
    title: "Legal",
  }, {
    name: "Facebook",
    title: "Authentication & Data",
  }, {
    name: "Fastly.com",
    title: "Scalable Content Delivery (CDN)",
  }, {
    name: "Google Civic",
    title: "Data",
  }, {
    name: "Greenberg Traurig, LLP",
    title: "Legal",
  }, {
    name: "League of Women Voters",
    title: "Data",
  }, {
    name: "MapLight",
    title: "Data",
  }, {
    name: "Microsoft",
    title: "For supporting Code for San Francisco",
  }, {
    name: "Sunlight Foundation",
    title: "Data",
  }, {
    name: "TurboVote, Democracy Works",
    title: "Data",
  }, {
    name: "Twitter",
    title: "Authentication & Data",
  }, {
    name: "Vote Smart",
    title: "Data",
  }, {
    name: "Voting Information Project, Pew Charitable Trusts",
    title: "Data",
  }, {
    name: "We Vote USA",
    title: "Software",
  }, {
    name: "Wikipedia",
    title: "Data",
  },
];

export const teamOfVolunteers = [{
    name: "Dale McGrew",
    title: "Oakland, CA",
  }, {
    name: "Jenifer Fernandez Ancona",
    title: "Oakland, CA",
  }, {
    name: "Anisha Jain",
    title: "San Jose, CA",
  }, {
    name: "Rob Simpson",
    title: "Warrenton, VA",
  }, {
    name: "Jeff French",
    title: "Oakland, CA",
  }, {
    name: "Neelam Joshi",
    title: "Columbus, OH",
  }, {
    name: "Alicia Kolar Prevost",
    title: "Washington, DC",
  }, {
    name: "Steve Podell",
    title: "Oakland, CA",
  }, {
    name: "Edward Ly",
    title: "Gresham, OR",
  }, {
    name: "Irene Florez",
    title: "San Francisco, CA",
  }, {
    name: "Yuanhsin Chang",
    title: "San Francisco, CA",
  }, {
    name: "Mansi Desai",
    title: "San Francisco, CA",
  }, {
    name: "Neil Dullaghan",
    title: "San Francisco, CA",
  }, {
    name: "Bharath D N Reddy",
    title: "Mountain View, CA",
  }, {
    name: "Sarah Clements",
    title: "San Francisco, CA",
  }, {
    name: "Zach Monteith",
    title: "San Francisco, CA",
  }, {
    name: "Lisa Cho",
    title: "San Francisco, CA",
  }, {
    name: "Nicolas Fiorini",
    title: "Arlington, VA",
  }, {
    name: "Colette Phair",
    title: "Oakland, CA",
  }, {
    name: "Jennifer Holmes",
    title: "Pacifica, CA",
  }, {
    name: "Joe Evans",
    title: "Santa Cruz, CA",
  }, {
    name: "Andrea Moed",
    title: "San Francisco, CA",
  }, {
    name: "Matt Holford",
    title: "New York, NY",
  }, {
    name: "Michael Kushman",
    title: "San Francisco, CA",
  }, {
    name: "Kathryn Lindquist",
    title: "San Francisco, CA",
  }, {
    name: "Ciero Kilpatrick",
    title: "Washington, DC",
  }, {
    name: "Elizabeth Janeczko",
    title: "Madison, WI",
  }, {
    name: "Eric Ogawa",
    title: "San Francisco, CA",
  }, {
    name: "Mary O\'Connor",
    title: "Sebastopol, CA",
  }, {
    name: "Harsha Dronamraju",
    title: "San Francisco, CA",
  }, {
    name: "Rohan Bhambhoria",
    title: "Mississauga, Ontario, Canada",
  }, {
    name: "Josh Southern",
    title: "San Francisco, CA",
  }, {
    name: "Nitin Garg",
    title: "San Francisco, CA",
  }, {
    name: "Niko Barry",
    title: "Berkeley, CA",
  }, {
    name: "Adam Barry",
    title: "San Francisco, CA",
  }, {
    name: "Marissa Luna",
    title: "Lansing, MI",
  }, {
    name: "Aaron Borden",
    title: "San Francisco, CA",
  }, {
    name: "Judy Johnson",
    title: "Oakland, CA",
  }, {
    name: "Udi Davidovich",
    title: "Walnut Creek, CA",
  }, {
    name: "Chris Arya",
    title: "San Francisco, CA",
  }, {
    name: "Tom Furlong",
    title: "Menlo Park, CA",
  }, {
    name: "Paul A. \"Dash\" McLean",
    title: "E. Palo Alto, CA",
  }, {
    name: "Fernando Mendoza",
    title: "San Francisco, CA",
  }, {
    name: "Andrew Roy Chen",
    title: "San Francisco, CA",
  }, {
    name: "Eric Olivera",
    title: "San Francisco, CA",
  }, {
    name: "Emily Hittle",
    title: "San Francisco, CA",
  }, {
    name: "Mikel Duffy",
    title: "San Francisco, CA",
  }, {
    name: "Robin Braverman",
    title: "Walnut Creek, CA",
  }, {
    name: "Grant Michael Palmer",
    title: "Oakland, CA",
  }, {
    name: "Alexandra Deas",
    title: "San Mateo, CA",
  }, {
    name: "Mario A. Rodríguez Jaén",
    title: "Alexandria, VA",
  }, {
    name: "Mike McConnell",
    title: "San Francisco, CA",
  }, {
    name: "Niyati Kothari",
    title: "Alpharetta, GA",
  }, {
    name: "Dan Ancona",
    title: "Oakland, CA",
  }, {
    name: "Zak Zaidman",
    title: "Ojai, CA",
  }, {
    name: "Debra Cleaver",
    title: "San Francisco, CA",
  }, {
    name: "William Winters",
    title: "Oakland, CA",
  }, {
    name: "Anat Shenker-Osorio",
    title: "Oakland, CA",
  }, {
    name: "Olivia Drummond",
    title: "Washington, DC",
  }, {
    name: "Steve Cohen",
    title: "Berkeley, CA",
  }, {
    name: "Kad Smith",
    title: "Berkeley, CA",
  }, {
    name: "Courtney Gonzales",
    title: "Benicia, CA",
  }, {
    name: "Jenna Haywood",
    title: "Berkeley, CA",
  }, {
    name: "Jayadev Akkiraju",
    title: "Santa Clara, CA",
  }, {
    name: "Raphael Merx",
    title: "San Francisco, CA",
  }, {
    name: "Susan Clark",
    title: "Oakland, CA",
  }, {
    name: "Kim Anderson",
    title: "San Francisco, CA",
  }, {
    name: "Betsy Neely Sikma",
    title: "Taylors, SC",
  }, {
    name: "Keith Underwood",
    title: "Alameda, CA",
  }, {
    name: "Marlene Flores",
    title: "San Francisco, CA",
  }, {
    name: "Jesse Aldridge",
    title: "San Francisco, CA",
  }, {
    name: "Josh Levinger",
    title: "Oakland, CA",
  }, {
    name: "Chi Lu",
    title: "San Francisco, CA",
  }, {
    name: "Leslie Castellanos",
    title: "San Francisco, CA",
  }, {
    name: "Miguel Elasmar",
    title: "Sarasota, FL",
  }, {
    name: "Cindy Cruz",
    title: "Daly City, CA",
  }, {
    name: "Nicole Shanahan",
    title: "Palo Alto, CA",
  }, {
    name: "Steve Whetstone",
    title: "San Francisco, CA",
  }, {
    name: "Brian Bordley",
    title: "Berkeley, CA",
  }, {
    name: "Marcus Busby",
    title: "San Francisco, CA",
  }, {
    name: "lulu",
    title: "New York, NY",
  }, {
    name: "Chris Griffith",
    title: "Santa Cruz, CA",
  }, {
    name: "Nathan Stankowski",
    title: "San Rafael, CA",
  }, {
    name: "Sean McMahon",
    title: "Redwood City, CA",
  }, {
    name: "Scott Wasserman",
    title: "Philadelphia, PA",
  }, {
    name: "Adrienne Yang",
    title: "Oakland, CA",
  }, {
    name: "Mark Rosenthal",
    title: "Oakland, CA",
  },
];
