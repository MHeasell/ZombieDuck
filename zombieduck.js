
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
        case "east":
            this.x += 1;
            break;
        case "south":
            this.y -= 1;
            break;
        case "west":
            this.x -= 1;
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
    this.duckPos = new Vector(10, 10);
    this.messages = [];
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
    this.pushMessage("Quack.");
};

World.prototype.bite = function () {
    this.pushMessage("The duck bites!");
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
        case "east":
        case "e":
        case "right":
        case "r":
            return "east";
        case "south":
        case "s":
        case "down":
        case "d":
            return "south";
        case "west":
        case "w":
        case "left":
        case "l":
            return "west";
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

World.prototype.doAction = function (action) {
    var tokens = action.split(" ");
    tokens = tokens.filter(function(elem) {
        return elem.length > 0;
    });

    if (tokens.length == 0) {
        return false;
    }

    switch (tokens[0]) {
        case "look":
        case "examine":
            return this.processLookAction(tokens.slice(1));
        case "go":
        case "move":
        case "walk":
        case "run":
            return this.processMoveAction(tokens.slice(1));
        case "w":
        case "wait":
        case "idle":
        case "stop":
            this.pushMessage("You wait for a while.");
            return true;
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
        $scope.history.push({type: "command", text: cmd});

        var worldChanged = model.doAction(cmd);

        if (worldChanged) {
            model.processDuckTurn();
            pumpMessages();

            var status = model.duckStatus();
            $scope.history.push({type: "response", text: status});
        }

        pumpMessages();
    };
}
