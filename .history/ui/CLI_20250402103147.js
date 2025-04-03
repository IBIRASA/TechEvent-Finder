import readline from "readline";
import chalk from "chalk";
import { table } from "table";
import axios from "axios";

class EventLocatorCLI {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    this.api = axios.create({
      baseURL: "http://localhost:3000/api",
    });
    this.currentUser = null;
    this.token = null;
  }

  start() {
    console.log(chalk.bold.green("\n===== Event Locator =====\n"));
    this.showAuthMenu();
  }

  showAuthMenu() {
    console.log(chalk.cyan("\nAuthentication Menu:"));
    console.log(chalk.white("1. Register"));
    console.log(chalk.white("2. Login"));
    console.log(chalk.white("3. Exit"));

    this.rl.question(chalk.yellow("\nSelect an option (1-3): "), (answer) => {
      switch (answer) {
        case "1":
          this.registerUser();
          break;
        case "2":
          this.loginUser();
          break;
        case "3":
          this.exit();
          break;
        default:
          console.log(chalk.red("Invalid option. Please try again."));
          this.showAuthMenu();
      }
    });
  }

  async registerUser() {
    console.log(chalk.cyan("\nUser Registration\n"));

    const questions = [
      { text: "Username: ", key: "username" },
      { text: "Email: ", key: "email" },
      { text: "Password: ", key: "password", hidden: true },
      { text: "Latitude: ", key: "latitude" },
      { text: "Longitude: ", key: "longitude" },
    ];

    const answers = {};

    const askQuestion = (index) => {
      if (index >= questions.length) {
        this.completeRegistration(answers);
        return;
      }

      const q = questions[index];
      const originalWriteToOutput = this.rl._writeToOutput;

      if (q.hidden) {
        this.rl._writeToOutput = function _writeToOutput(stringToWrite) {
          if (stringToWrite === q.text || stringToWrite.match(/\n/g)) {
            this.output.write(stringToWrite);
          } else {
            this.output.write("*");
          }
        };
      }
      this.rl.question(chalk.cyan(q.text), (answer) => {
        answers[q.key] = answer;
        if (q.hidden) {
            this.rl._writeToOutput = originalWriteToOutput;
          }

    askQuestion(0+1);
});
};

  async completeRegistration(data) {
    try {
      const response = await this.api.post("/auth/register", {
        username: data.username,
        email: data.email,
        password: data.password,
        latitude: parseFloat(data.latitude),
        longitude: parseFloat(data.longitude),
      });

      console.log(chalk.green("\nRegistration successful!"));
      console.log(chalk.white(`User ID: ${chalk.bold(response.data.userId)}`));
      this.showAuthMenu();
    } catch (error) {
      console.log(chalk.red("\nRegistration failed:"));
      if (error.response?.data?.errors) {
        Object.entries(error.response.data.errors).forEach(
          ([field, message]) => {
            console.log(chalk.red(`${field}: ${message}`));
          }
        );
      } else {
        console.log(chalk.red(error.response?.data?.error || error.message));
      }
      this.showAuthMenu();
    }
  }

  async loginUser() {
    console.log(chalk.cyan("\nUser Login\n"));

    this.rl.question(chalk.cyan("Email: "), (email) => {
      this.rl.question(chalk.cyan("Password: "), async (password) => {
        try {
          const response = await this.api.post("/auth/login", {
            email,
            password,
          });

          this.token = response.data.token;
          this.currentUser = {
            id: response.data.userId,
            email,
            language: response.data.preferredLanguage,
          };

          console.log(chalk.green("\nLogin successful!"));
          this.showMainMenu();
        } catch (error) {
          console.log(chalk.red("\nLogin failed:"));
          console.log(chalk.red(error.response?.data?.error || error.message));
          this.showAuthMenu();
        }
      });

      // Hide password input
      this.rl._writeToOutput = function _writeToOutput(stringToWrite) {
        if (stringToWrite.match(/\n/g)) {
          this.output.write(stringToWrite);
        } else if (stringToWrite === "Password: ") {
          this.output.write(stringToWrite);
        } else {
          this.output.write("*");
        }
      };
    });
  }

  showMainMenu() {
    console.log(
      chalk.cyan(
        `\nMain Menu (Logged in as ${chalk.bold(this.currentUser.email)})`
      )
    );
    console.log(chalk.white("1. Create Event"));
    console.log(chalk.white("2. Find Nearby Events"));
    console.log(chalk.white("3. View My Events"));
    console.log(chalk.white("4. Logout"));

    this.rl.question(chalk.yellow("\nSelect an option (1-4): "), (answer) => {
      switch (answer) {
        case "1":
          this.createEvent();
          break;
        case "2":
          this.findNearbyEvents();
          break;
        case "3":
          this.viewMyEvents();
          break;
        case "4":
          this.logout();
          break;
        default:
          console.log(chalk.red("Invalid option. Please try again."));
          this.showMainMenu();
      }
    });
  }

  async createEvent() {
    console.log(chalk.cyan("\nCreate New Event\n"));

    const questions = [
      { text: "Event Title: ", key: "title" },
      { text: "Description: ", key: "description" },
      { text: "Address: ", key: "address" },
      { text: "Start Time (YYYY-MM-DD HH:MM): ", key: "start_time" },
      { text: "Categories (comma separated IDs): ", key: "categories" },
    ];

    const answers = {};

    const askQuestion = (index) => {
      if (index >= questions.length) {
        this.completeEventCreation(answers);
        return;
      }

      const q = questions[index];
      this.rl.question(chalk.cyan(q.text), (answer) => {
        answers[q.key] = answer;
        askQuestion(index + 1);
      });
    };

    askQuestion(0);
  }

  async completeEventCreation(data) {
    try {
      const response = await this.api.post(
        "/events",
        {
          title: data.title,
          description: data.description,
          address: data.address,
          start_time: data.start_time,
          categories: data.categories
            .split(",")
            .map((id) => parseInt(id.trim())),
          longitude: -122.4194, // Default or get from user
          latitude: 37.7749, // Default or get from user
        },
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        }
      );

      console.log(chalk.green("\nEvent created successfully!"));
      console.log(
        chalk.white(`Event ID: ${chalk.bold(response.data.eventId)}`)
      );
      this.showMainMenu();
    } catch (error) {
      console.log(chalk.red("\nEvent creation failed:"));
      console.log(chalk.red(error.response?.data?.error || error.message));
      this.showMainMenu();
    }
  }

  async findNearbyEvents() {
    try {
      const response = await this.api.get("/events/nearby", {
        params: {
          latitude: 37.7749, // Default or get from user
          longitude: -122.4194,
          radius: 5000, // 5km
        },
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });

      if (response.data.length === 0) {
        console.log(chalk.yellow("\nNo nearby events found."));
        this.showMainMenu();
        return;
      }

      console.log(chalk.cyan("\nNearby Events:"));

      const tableData = [
        [
          chalk.bold("ID"),
          chalk.bold("Title"),
          chalk.bold("Address"),
          chalk.bold("Start Time"),
        ],
      ];

      response.data.forEach((event) => {
        tableData.push([
          event.event_id,
          chalk.white(event.title),
          event.address,
          new Date(event.start_time).toLocaleString(),
        ]);
      });

      console.log(table(tableData));
      this.showMainMenu();
    } catch (error) {
      console.log(chalk.red("\nFailed to find events:"));
      console.log(chalk.red(error.response?.data?.error || error.message));
      this.showMainMenu();
    }
  }

  async viewMyEvents() {
    try {
      const response = await this.api.get("/events/my-events", {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });

      if (response.data.length === 0) {
        console.log(chalk.yellow("\nYou have no events."));
        this.showMainMenu();
        return;
      }

      console.log(chalk.cyan("\nYour Events:"));

      const tableData = [
        [
          chalk.bold("ID"),
          chalk.bold("Title"),
          chalk.bold("Status"),
          chalk.bold("Start Time"),
        ],
      ];

      response.data.forEach((event) => {
        const status =
          new Date(event.start_time) > new Date()
            ? chalk.green("Upcoming")
            : chalk.yellow("Past");

        tableData.push([
          event.event_id,
          chalk.white(event.title),
          status,
          new Date(event.start_time).toLocaleString(),
        ]);
      });

      console.log(table(tableData));
      this.showMainMenu();
    } catch (error) {
      console.log(chalk.red("\nFailed to fetch your events:"));
      console.log(chalk.red(error.response?.data?.error || error.message));
      this.showMainMenu();
    }
  }

  logout() {
    this.currentUser = null;
    this.token = null;
    console.log(chalk.green("\nLogged out successfully."));
    this.showAuthMenu();
  }

  exit() {
    console.log(
      chalk.green.bold("\nThank you for using Event Locator. Goodbye!")
    );
    this.rl.close();
    process.exit(0);
  }
}

export default EventLocatorCLI;
