/**
 * ============================================================================
 * Project: Modular Number Guessing Game in C
 * Description: A feature-rich, modular terminal-based Number Guessing Game.
 * Features:
 *   - Single Player Mode (Level 1: 1-100, Level 2: 1-1000 with Extreme Hint)
 *   - Multiplayer Tournament Mode (2 to 4 players, Scoreboard & Tie Handling)
 *   - Head-to-Head Duel Mode (1v1 PVP with hidden secret numbers)
 *   - Robust input buffer validation & Cross-platform screen clearing
 * ============================================================================
 */

#include <stdio.h>
#include <stdlib.h>
#include <time.h>
#include <string.h>
#include <stdbool.h>

/* ============================================================================
 * CONSTANTS & DEFINITIONS
 * ============================================================================ */
#define MAX_NAME_LEN 50
#define MAX_PLAYERS  4
#define MIN_PLAYERS  2

/* Player representation for tournament mode */
typedef struct {
    char name[MAX_NAME_LEN];
    int attemptsTaken;
    bool hasWon;
} Player;

/* ============================================================================
 * FUNCTION DECLARATIONS (PROTOTYPES)
 * ============================================================================ */
void showMainMenu(void);
void playSinglePlayer(void);
void playMultiplayerTournament(void);
void playHeadToHead(void);
void giveFeedback(int guess, int secret, int level, bool *extremeHintUsed);
int  getRandomNumber(int min, int max);
void clearScreen(void);
void clearInputBuffer(void);

/* Helper UI & Input Functions */
int  getValidInteger(int min, int max, const char *prompt);
void getStringInput(char *buffer, int maxLen, const char *prompt);
void pauseAndContinue(void);
void printBanner(const char *title);
void printDivider(void);

/* ============================================================================
 * MAIN FUNCTION
 * ============================================================================ */
int main(void) {
    /* Seed pseudo-random number generator once at start of application */
    srand((unsigned int)time(NULL));

    int choice = 0;

    do {
        clearScreen();
        showMainMenu();
        choice = getValidInteger(1, 4, "\n Select an option (1-4): ");

        switch (choice) {
            case 1:
                playSinglePlayer();
                break;
            case 2:
                playMultiplayerTournament();
                break;
            case 3:
                playHeadToHead();
                break;
            case 4:
                clearScreen();
                printBanner("THANK YOU FOR PLAYING! GOODBYE!");
                printf("\n Exiting the game. Have a great day!\n\n");
                break;
            default:
                break;
        }
    } while (choice != 4);

    return 0;
}

/* ============================================================================
 * SCREEN & INPUT UTILITIES
 * ============================================================================ */

/**
 * Clears the terminal screen across Windows, Linux, and macOS.
 */
void clearScreen(void) {
#ifdef _WIN32
    system("cls");
#else
    system("clear");
#endif
}

/**
 * Empties any remaining characters from the standard input stream
 * to prevent invalid inputs from creating infinite loops or bad state.
 */
void clearInputBuffer(void) {
    int c;
    while ((c = getchar()) != '\n' && c != EOF);
}

/**
 * Safely prompts for an integer and ensures it falls within [min, max].
 * Handles non-numeric inputs gracefully.
 */
int getValidInteger(int min, int max, const char *prompt) {
    int value;
    int itemsRead;

    while (1) {
        if (prompt != NULL) {
            printf("%s", prompt);
        }

        itemsRead = scanf("%d", &value);

        if (itemsRead != 1) {
            printf(" [!] Invalid input! Please enter a numeric value.\n");
            clearInputBuffer();
            continue;
        }

        clearInputBuffer();

        if (value < min || value > max) {
            printf(" [!] Out of range! Please enter a number between %d and %d.\n", min, max);
            continue;
        }

        return value;
    }
}

/**
 * Safely reads a string from user input and strips trailing newlines.
 */
void getStringInput(char *buffer, int maxLen, const char *prompt) {
    if (prompt != NULL) {
        printf("%s", prompt);
    }

    if (fgets(buffer, maxLen, stdin) != NULL) {
        size_t len = strlen(buffer);
        if (len > 0 && buffer[len - 1] == '\n') {
            buffer[len - 1] = '\0';
        }
    }

    /* Fallback if user just hit enter */
    if (strlen(buffer) == 0) {
        strncpy(buffer, "Player", maxLen - 1);
        buffer[maxLen - 1] = '\0';
    }
}

/**
 * Prompts the user to press Enter to continue.
 */
void pauseAndContinue(void) {
    printf("\n Press [ENTER] to continue...");
    getchar();
}

/* ============================================================================
 * UI FORMATTING HELPERS
 * ============================================================================ */

void printDivider(void) {
    printf("+--------------------------------------------------------------+\n");
}

void printBanner(const char *title) {
    printDivider();
    printf("| %-60s |\n", title);
    printDivider();
}

/**
 * Generates a pseudo-random integer between min and max (inclusive).
 */
int getRandomNumber(int min, int max) {
    return min + (rand() % (max - min + 1));
}

/* ============================================================================
 * MAIN MENU DISPLAY
 * ============================================================================ */
void showMainMenu(void) {
    printBanner("          *** NUMBER GUESSING GAME MASTER ***          ");
    printf("|                                                              |\n");
    printf("|  [1] Single Player (Solo Mode)                               |\n");
    printf("|  [2] Multiplayer Tournament (2 to 4 Players)                 |\n");
    printf("|  [3] Head-to-Head Duel (1v1 PVP)                             |\n");
    printf("|  [4] Exit Game                                               |\n");
    printf("|                                                              |\n");
    printDivider();
}

/* ============================================================================
 * FEEDBACK ENGINE
 * ============================================================================ */
/**
 * Evaluates the user's guess against the secret number and prints hints.
 * In Level 2, triggers an Extreme Hint if difference > 500 (once per round).
 */
void giveFeedback(int guess, int secret, int level, bool *extremeHintUsed) {
    if (guess == secret) {
        printf("\n [***] Correct! You found the secret number!\n");
        return;
    }

    /* Special Extreme Hint logic for Single Player Level 2 */
    if (level == 2 && extremeHintUsed != NULL && !(*extremeHintUsed)) {
        int diff = abs(guess - secret);
        if (diff > 500) {
            *extremeHintUsed = true;
            if (guess > secret + 500) {
                printf("\n [!] EXTREME HINT: Too high! (Difference is greater than 500)\n");
            } else if (guess < secret - 500) {
                printf("\n [!] EXTREME HINT: Too low! (Difference is greater than 500)\n");
            }
        }
    }

    /* Standard Feedback */
    if (guess < secret) {
        printf(" [-] You guessed it lower. Try a higher number!\n");
    } else {
        printf(" [+] You guessed it higher. Try a lower number!\n");
    }
}

/* ============================================================================
 * GAME MODE 1: SINGLE PLAYER
 * ============================================================================ */
void playSinglePlayer(void) {
    clearScreen();
    printBanner("                 MODE 1: SINGLE PLAYER                 ");
    printf("| Select Difficulty Level:                                     |\n");
    printf("|   [1] Level 1: Range 1 - 100   | Max 10 Attempts             |\n");
    printf("|   [2] Level 2: Range 1 - 1000  | Max 15 Attempts             |\n");
    printf("|   [3] Back to Main Menu                                      |\n");
    printDivider();

    int levelChoice = getValidInteger(1, 3, "\n Choose Level (1-3): ");
    if (levelChoice == 3) {
        return;
    }

    int maxRange    = (levelChoice == 1) ? 100 : 1000;
    int maxAttempts = (levelChoice == 1) ? 10  : 15;
    int secret      = getRandomNumber(1, maxRange);
    bool extremeHintUsed = false;
    bool won = false;
    int attempt = 0;

    clearScreen();
    char titleBuffer[70];
    snprintf(titleBuffer, sizeof(titleBuffer), " SINGLE PLAYER: LEVEL %d (Range: 1 - %d)", levelChoice, maxRange);
    printBanner(titleBuffer);

    for (attempt = 1; attempt <= maxAttempts; attempt++) {
        int attemptsRemaining = maxAttempts - attempt + 1;
        printf("\n Attempt %d of %d (Remaining: %d)\n", attempt, maxAttempts, attemptsRemaining);

        char prompt[60];
        snprintf(prompt, sizeof(prompt), " Enter your guess (1-%d): ", maxRange);
        int guess = getValidInteger(1, maxRange, prompt);

        giveFeedback(guess, secret, levelChoice, &extremeHintUsed);

        if (guess == secret) {
            won = true;
            break;
        }
    }

    printDivider();
    if (won) {
        printf("\n [VICTORY] Congratulations! You cracked the number in %d attempt(s)!\n", attempt);
    } else {
        printf("\n [GAME OVER] You have run out of attempts.\n");
        printf(" The secret number was: %d\n", secret);
    }
    printDivider();

    pauseAndContinue();
}

/* ============================================================================
 * GAME MODE 2: MULTIPLAYER TOURNAMENT (2 TO 4 PLAYERS)
 * ============================================================================ */
void playMultiplayerTournament(void) {
    clearScreen();
    printBanner("           MODE 2: MULTIPLAYER TOURNAMENT (2-4)        ");
    printf(" Fixed Range: 1 to 100 | Max Attempts per Player: 10\n");
    printDivider();

    int numPlayers = getValidInteger(MIN_PLAYERS, MAX_PLAYERS, "\n Enter number of players (2-4): ");
    Player players[MAX_PLAYERS];

    /* Collect Player Names */
    printf("\n");
    for (int i = 0; i < numPlayers; i++) {
        char prompt[60];
        snprintf(prompt, sizeof(prompt), " Enter name for Player %d: ", i + 1);
        getStringInput(players[i].name, MAX_NAME_LEN, prompt);
        players[i].attemptsTaken = 0;
        players[i].hasWon = false;
    }

    /* Run Sequential Rounds for each player */
    const int maxRange = 100;
    const int maxAttempts = 10;

    for (int i = 0; i < numPlayers; i++) {
        clearScreen();
        char roundTitle[70];
        snprintf(roundTitle, sizeof(roundTitle), " TOURNAMENT ROUND: %s's TURN ", players[i].name);
        printBanner(roundTitle);
        printf(" Range: 1 to %d | Maximum Attempts: %d\n", maxRange, maxAttempts);
        printf(" Get ready, %s!\n", players[i].name);
        printDivider();

        int secret = getRandomNumber(1, maxRange);
        int attempt = 0;

        for (attempt = 1; attempt <= maxAttempts; attempt++) {
            int remaining = maxAttempts - attempt + 1;
            printf("\n Attempt %d of %d (Remaining: %d)\n", attempt, maxAttempts, remaining);

            char prompt[60];
            snprintf(prompt, sizeof(prompt), " %s, enter your guess (1-%d): ", players[i].name, maxRange);
            int guess = getValidInteger(1, maxRange, prompt);

            giveFeedback(guess, secret, 1, NULL);

            if (guess == secret) {
                players[i].hasWon = true;
                players[i].attemptsTaken = attempt;
                break;
            }
        }

        if (!players[i].hasWon) {
            players[i].attemptsTaken = maxAttempts;
            printf("\n [!] Round over! %s could not guess the number (Secret was %d).\n", players[i].name, secret);
        } else {
            printf("\n [!] Great job, %s! Completed in %d attempts.\n", players[i].name, players[i].attemptsTaken);
        }

        if (i < numPlayers - 1) {
            printf("\n Next up: %s\n", players[i + 1].name);
            pauseAndContinue();
        } else {
            pauseAndContinue();
        }
    }

    /* Final Scoreboard & Winner Determination */
    clearScreen();
    printBanner("             FINAL TOURNAMENT SCOREBOARD               ");
    printf("| %-4s | %-20s | %-15s | %-12s |\n", "Pos", "Player Name", "Attempts Taken", "Result");
    printDivider();

    for (int i = 0; i < numPlayers; i++) {
        printf("| %-4d | %-20s | %-15d | %-12s |\n",
               i + 1,
               players[i].name,
               players[i].attemptsTaken,
               players[i].hasWon ? "SOLVED" : "FAILED");
    }
    printDivider();

    /* Find Best (Lowest) Score among winners */
    int minAttempts = 999;
    bool anyWinner = false;

    for (int i = 0; i < numPlayers; i++) {
        if (players[i].hasWon && players[i].attemptsTaken < minAttempts) {
            minAttempts = players[i].attemptsTaken;
            anyWinner = true;
        }
    }

    if (!anyWinner) {
        printf("\n [NO WINNER] None of the players managed to guess their secret number!\n");
    } else {
        printf("\n [CHAMPION] The winner(s) with %d attempts:\n", minAttempts);
        for (int i = 0; i < numPlayers; i++) {
            if (players[i].hasWon && players[i].attemptsTaken == minAttempts) {
                printf("   >>> %s <<<\n", players[i].name);
            }
        }
    }
    printDivider();

    pauseAndContinue();
}

/* ============================================================================
 * GAME MODE 3: HEAD-TO-HEAD DUEL (1V1 PVP)
 * ============================================================================ */
void playHeadToHead(void) {
    clearScreen();
    printBanner("               MODE 3: HEAD-TO-HEAD DUEL (1v1)         ");
    printf(" Fixed Range: 1 to 100\n");
    printf(" Each player secretly sets a number for their opponent.\n");
    printDivider();

    char p1Name[MAX_NAME_LEN];
    char p2Name[MAX_NAME_LEN];

    printf("\n");
    getStringInput(p1Name, MAX_NAME_LEN, " Enter Player 1 Name: ");
    getStringInput(p2Name, MAX_NAME_LEN, " Enter Player 2 Name: ");

    /* Player 1 Secret Setup */
    clearScreen();
    printBanner(" SECRET NUMBER SETUP ");
    printf(" %s, it's your turn to set a secret number for %s to guess.\n", p1Name, p2Name);
    printf(" (Make sure %s is looking away!)\n\n", p2Name);
    int p1Secret = getValidInteger(1, 100, " Enter secret number (1-100): ");
    clearScreen();
    printf("\n [OK] Secret number recorded. Screen cleared for privacy!\n");
    pauseAndContinue();

    /* Player 2 Secret Setup */
    clearScreen();
    printBanner(" SECRET NUMBER SETUP ");
    printf(" %s, it's your turn to set a secret number for %s to guess.\n", p2Name, p1Name);
    printf(" (Make sure %s is looking away!)\n\n", p1Name);
    int p2Secret = getValidInteger(1, 100, " Enter secret number (1-100): ");
    clearScreen();
    printf("\n [OK] Secret number recorded. Screen cleared for privacy!\n");
    pauseAndContinue();

    /* Alternating Turns */
    clearScreen();
    printBanner("             THE DUEL BEGINS! (Range: 1 - 100)          ");
    printf(" Alternating turns. The first player to find the opponent's number wins!\n");
    printDivider();

    int round = 1;
    bool gameOver = false;

    while (!gameOver) {
        printf("\n==================== ROUND %d ====================\n", round);

        /* Player 1's Turn (guessing p2Secret) */
        printf("\n >>> %s's TURN (Guessing %s's secret number)\n", p1Name, p2Name);
        char prompt1[70];
        snprintf(prompt1, sizeof(prompt1), " %s, enter your guess (1-100): ", p1Name);
        int p1Guess = getValidInteger(1, 100, prompt1);

        giveFeedback(p1Guess, p2Secret, 1, NULL);

        if (p1Guess == p2Secret) {
            printDivider();
            printf("\n [VICTORY] %s WINS THE DUEL IN ROUND %d!\n", p1Name, round);
            printf(" %s successfully guessed %s's secret number (%d)!\n", p1Name, p2Name, p2Secret);
            printDivider();
            gameOver = true;
            break;
        }

        /* Player 2's Turn (guessing p1Secret) */
        printf("\n >>> %s's TURN (Guessing %s's secret number)\n", p2Name, p1Name);
        char prompt2[70];
        snprintf(prompt2, sizeof(prompt2), " %s, enter your guess (1-100): ", p2Name);
        int p2Guess = getValidInteger(1, 100, prompt2);

        giveFeedback(p2Guess, p1Secret, 1, NULL);

        if (p2Guess == p1Secret) {
            printDivider();
            printf("\n [VICTORY] %s WINS THE DUEL IN ROUND %d!\n", p2Name, round);
            printf(" %s successfully guessed %s's secret number (%d)!\n", p2Name, p1Name, p1Secret);
            printDivider();
            gameOver = true;
            break;
        }

        round++;
    }

    pauseAndContinue();
}
