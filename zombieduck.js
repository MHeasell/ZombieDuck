
String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

function mod (a, b) {
    return ((a % b) + b) % b;
}

function Vector(x, y) {
    this.x = x;
    this.y = y;
}

function vecAdd(a, b) {
    return new Vector(a.x + b.x, a.y + b.y);
}

function vecSub(a, b) {
    return new Vector(a.x - b.x, a.y - b.y);
}

Vector.prototype.angle = function () {
    return Math.atan2(this.y, this.x);
};

Vector.prototype.length = function () {
    return Math.sqrt((this.x * this.x) + (this.y * this.y));
};

Vector.prototype.vectorTo = function (other) {
    return vecSub(other, this);
};

Vector.prototype.offsetDirection = function (direction) {
    switch (direction) {
        case "north":
            this.y += 1;
            break;
        case "north-east":
            this.x += 1;
            this.y += 1;
            break;
        case "east":
            this.x += 1;
            break;
        case "south-east":
            this.x += 1;
            this.y -= 1;
            break;
        case "south":
            this.y -= 1;
            break;
        case "south-west":
            this.y -= 1;
            this.x -= 1;
        case "west":
            this.x -= 1;
            break;
        case "north-west":
            this.x -= 1;
            this.y += 1;
            break;
        default:
            throw "Don't know direction: " + direction;
    }
};

function direction(angle) {
    angle += Math.PI / 8;
    angle = mod(angle, Math.PI * 2);

    var dirs = ["east", "north-east", "north", "north-west", "west", "south-west", "south", "south-east"];

    for (var i = 0; i < 8; ++i) {
        if (angle <= (i + 1) * (Math.PI/4)) {
            return dirs[i];
        }
    }

    throw "bad angle: " + angle;
}

function direction4(angle) {
    angle += Math.PI / 4;
    angle = mod(angle, Math.PI * 2);

    var dirs = ["east", "north", "west", "south"];

    for (var i = 0; i < 4; ++i) {
        if (angle <= (i + 1) * (Math.PI/2)) {
            return dirs[i];
        }
    }

    throw "bad angle: " + angle;
}

function World() {
    this.playerPos = new Vector(5, 5);
    this.playerHealth = 3;
    this.duckPos = new Vector(10, 10);
    this.messages = [];
    this.gameOver = false;
}

World.prototype.getDuckDirection = function() {
    var duckOffset = vecSub(this.duckPos, this.playerPos);
    var duckAngle = duckOffset.angle();

    return direction(duckAngle);
};

World.prototype.getDuckDistance = function() {
    return vecSub(this.duckPos, this.playerPos).length();
};

World.prototype.describeDuckDistance = function () {
    var dist = this.getDuckDistance();
    if (dist > 50) {
        return "in the far distance";
    }
    if (dist > 20) {
        return "in the distance";
    }
    if (dist > 10) {
        return "a short distance";
    }
    if (dist > 5) {
        return "quite close by";
    }
    else {
        return "dangerously close";
    }
};

World.prototype.describeWorld = function () {
    var duckDir = this.getDuckDirection();

    var mainStr = [
    "You are standing in the middle of an expansive barren wasteland.",
    "Empty space stretches out around you.",
    "In the distance, tough, rugged looking walls circle the area, blocking you in.",
    this.describeDuckDistance().capitalize() + " to the " + this.getDuckDirection() + " you see a duck."
    ].join(" ");
    return mainStr;
};

World.prototype.describeDuck = function () {
    var dist = this.getDuckDistance();
    if (dist > 50) {
        return "You can't quite make it out from here. It seems to be duck shaped, in any case.";
    }
    if (dist > 20) {
        return [
            "It's quite far away, but it's clearly a duck of some description.",
            "There is something funny about the way it walks, though."
        ].join(" ");
    }
    if (dist > 10) {
        return [
            "You see a ragged looking duck.",
            "It has definitely seen better days, and bits of it seem to be... missing.",
            "From this distance you can't tell more, but it is definitely no ordinary duck."
        ].join(" ");
    }
    if (dist > 5) {
        return [
            "The duck looks to be quite ill.",
            "it has an off-color look and is missing pieces of itself.",
            "You feel a sense of impending dread",
            "-- it would definitely be a bad thing if it got any closer."
        ].join(" ");
    }
    else {
        return [
            "The vile, putrid abomination is almost on top of you.",
            "Chunks of flesh hang ragged from the duck's rotten bones,",
            "and its only remaining eye dangles limply from its socket.",
            "Spats of blood drip from its trembling feathers,",
            "while saliva drools from its half-open bill.",
            "This duck -- this impossible creature -- is certainly not one of the living.",
            "It is, in fact, a zombie duck."
        ].join(" ");
    }

};

World.prototype.describe = function (target) {
    if (target == null) {
        target = "world";
    }

    switch (target) {
        case "duck":
            return this.describeDuck();
        case "surroundings":
        case "place":
        case "location":
        case "area":
        case "scene":
        case "world":
            return this.describeWorld();
        default:
            return "Don't know about " + target;
    }
};

World.prototype.doDescribeAction = function (target) {
    this.pushMessage(this.describe(target));
};

World.prototype.move = function (direction) {
    this.playerPos.offsetDirection(direction);
};

World.prototype.moveDuck = function (direction) {
    this.duckPos.offsetDirection(direction);
};

World.prototype.quack = function () {
    var msgs = ["Quack.", "Wack.", "Waack.", "Quack?", "Quackwack."];
    var msg = msgs[Math.floor(Math.random() * msgs.length)];
    this.pushMessage(msg);
};

World.prototype.bite = function () {
    if (this.playerHealth === 3) {
        this.pushMessage([
            "The duck bites, taking a surprisingly large chunk out of your leg.",
            "It is quite a gruesome sight."
            ].join(" "));
        --this.playerHealth;
    }
    else if (this.playerHealth === 2) {
        this.pushMessage([
            "The duck snaps at your remaining healthy leg, but gets only a nibble.",
        ].join(" "));
        this.playerHealth--;
    }
    else if (this.playerHealth === 1) {
        this.pushMessage([
            "The duck clamps its bill around your leg and retrieves a sizable portion.",
            "With both legs now crippled, you collapse into a crumpled heap.",
            "The duck quickly finishes you off and feasts on your flesh."
        ].join(" "));
        --this.playerHealth;
        this.loseGame();
    }
};

World.prototype.processDuckTurn = function () {
    if (Math.random() <= 0.2) {
        this.quack();
    }

    var playerVec = this.duckPos.vectorTo(this.playerPos);
    var playerDist = playerVec.length();

    // attack nearby player
    if (playerDist <= 1.1) {
        this.bite();
        return;
    }

    // otherwise, waddle towards them
    var playerDir = direction4(playerVec.angle());
    this.moveDuck(playerDir);
    this.pushMessage("The duck waddles in your direction.");
};

World.prototype.doMoveAction = function (direction) {
    this.move(direction);
    this.pushMessage("You move " + direction + ".");
};

function convertToDirection(input) {
    switch (input) {
        case "up":
        case "u":
        case "north":
        case "n":
            return "north";
        case "north-east":
        case "north east":
        case "ne":
            return "north-east";
        case "east":
        case "e":
        case "right":
        case "r":
            return "east";
        case "south-east":
        case "south east":
        case "se":
            return "south-east";
        case "south":
        case "s":
        case "down":
        case "d":
            return "south";
        case "south-west":
        case "south west":
        case "se":
            return "south-west";
        case "west":
        case "w":
        case "left":
        case "l":
            return "west";
        case "north-west":
        case "north west":
        case "nw":
            return "north-west";
        default:
            return null;
    }
}

World.prototype.pushMessage = function (msg) {
    this.messages.push(msg);
};

World.prototype.takeMessage = function () {
    return this.messages.shift();
};

World.prototype.processLookAction = function (args) {
    if (args.length == 0) {
        this.doDescribeAction(null);
        return false;
    }

    if (args[0] === "at") {
        if (args.length == 1) {
            this.pushMessage("Look at what?");
            return false;
        }

        this.doDescribeAction(args.slice(1).join(" "));
        return false;
    }

    this.doDescribeAction(args.join(" "));
    return false;
};

World.prototype.processMoveAction = function (args) {
    if (args.length < 1) {
        this.pushMessage("Move where?");
        return false;
    }

    var dir = convertToDirection(args[0]);
    if (dir) {
        this.doMoveAction(dir);
        return true;
    }

    this.pushMessage("Don't know direction: " + args[0]);
    return false;
};

World.prototype.kickDuck = function () {
    var duckDistance = this.getDuckDistance();

    if (duckDistance > 20) {
        this.pushMessage([
            "You flail your legs menacingly, but the duck, being a considerable distance away, is unaffected.",
            "It is not particularly threatened by your display."
        ].join(" "));
    }
    if (duckDistance > 10) {
        this.pushMessage([
            "You flail your legs menacingly, but the duck, being safely out of range, is unaffected.",
        ].join(" "));
    }
    if (duckDistance > 2) {
        this.pushMessage([
            "You take a determined swing at the duck with your right leg",
            "but fail unspectacularly, as the duck is a bit too far from your reach.",
        ].join(" "));
    }
    else {
        this.pushMessage([
            "You deliver a good hard boot directly to the duck's belly.",
            "You score a direct hit, launching the duck a considerable distance into the air.",
            "It sails over the wall and into the distance, making a quiet, yet satisfying thud,",
            "followed by a confused solitary quack."
        ].join(" "));
        this.winGame();
    }
};

World.prototype.kickWall = function () {
    this.pushMessage("You consider kicking the wall, but think better of it, as they are quite a bit sturdier than you are.");
};

World.prototype.winGame = function () {
    this.pushMessage("");
    this.pushMessage([
        "Against all odds you have conquered the fearsome zombie duck.",
        "Truly you are the hero of our time and saviour of your people.",
        "Thanks for playing... quack."
    ].join(" "));
    this.gameOver = true;
};

World.prototype.loseGame = function () {
    this.pushMessage("GAME OVER");
    this.gameOver = true;
};

World.prototype.doKickAction = function (target) {
    switch (target) {
        case "duck":
            this.kickDuck();
            return true;
        case "wall":
            this.kickWall();
            return true;
        default:
            this.pushMessage("Can't find a " + target + "to kick.");
            return false;
    }
};

World.prototype.processKickAction = function (args) {
    if (args.length < 1) {
        this.pushMessage("Kick what?");
        return false;
    }

    return this.doKickAction(args.join(" "));
};

World.prototype.doAction = function (action) {
    var tokens = action.toLowerCase().split(" ");
    tokens = tokens.filter(function(elem) {
        return elem.length > 0;
    });

    if (tokens.length == 0) {
        return false;
    }

    switch (tokens[0]) {
        case "look":
        case "examine":
        case "describe":
        case "desc":
            return this.processLookAction(tokens.slice(1));
        case "go":
        case "move":
        case "walk":
        case "run":
            return this.processMoveAction(tokens.slice(1));
        case "wait":
        case "idle":
        case "stop":
            this.pushMessage("You wait for a while.");
            return true;
        case "quack":
            this.pushMessage([
                "Becoming one with your inner duck, you do your best impression of your adversary.",
                "The duck looks rather puzzled by this turn of events, but is otherwise unfazed."
            ].join(" "));
            return false;
        case "kick":
            return this.processKickAction(tokens.slice(1));
        default:
            var dir = convertToDirection(tokens[0]);
            if (dir) {
                this.doMoveAction(dir);
                return true;
            }

            this.pushMessage("Don't know how to do that");
            return false;
    }
};

World.prototype.duckStatus = function() {
    var distance = this.describeDuckDistance();
    var dir = this.getDuckDirection();
    return "The duck is now " + distance + " to the " + dir + ".";
};

function GameCtrl ($scope) {

    var model = new World();

    $scope.history = [
        {type: "response", text: model.describe()}
    ];

    function pumpMessages() {
        var item;
        while ((item = model.takeMessage()) !== undefined) {
            $scope.history.push({type: "response", text: item});
        }
    };

    $scope.enterCmd = function () {
        var cmd = $scope.cmdText;
        $scope.cmdText = "";

        if (model.gameOver) {
            return;
        }

        $scope.history.push({type: "command", text: cmd});

        var worldChanged = model.doAction(cmd);

        pumpMessages();

        if (model.gameOver) {
            return;
        }

        if (worldChanged) {
            model.processDuckTurn();
            pumpMessages();

            if (model.gameOver) {
                return;
            }

            var status = model.duckStatus();
            $scope.history.push({type: "response", text: status});
        }

        pumpMessages();
    };
}
