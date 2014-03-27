
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

function World() {
    this.playerPos = new Vector(5, 5);
    this.duckPos = new Vector(10, 10);
}

World.prototype.getDuckDirection = function() {
    var duckOffset = vecSub(this.duckPos, this.playerPos);
    var duckAngle = duckOffset.angle();
    duckAngle = mod(duckAngle, Math.PI);

    duckAngle -= Math.PI / 4;

    var dirs = ["east", "north", "west", "south"];

    for (var i = 0; i < 4; ++i) {
        if (duckAngle <= (i + 1) * (Math.PI/4)) {
            return dirs[i];
        }
    }

    throw "bad angle, what";
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
        return "It's a duck. There is something funny about the way it walks, though.";
    }
    if (dist > 10) {
        return "The duck is staring intently at you.";
    }
    else {
        return "OH GOD NO";
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

World.prototype.doAction = function (action) {
    var tokens = action.split(" ");
    if (tokens[0] === "look") {
        if (tokens.length > 1) {
            return this.describe(tokens[1]);
        }
        else {
            return this.describe(null);
        }

    }
    else {
        return "Don't know how to do that";
    }
};

function GameCtrl ($scope) {

    var model = new World();

    $scope.history = [
        {type: "response", text: model.describe()}
    ];

    $scope.enterCmd = function () {
        var cmd = $scope.cmdText;
        $scope.cmdText = "";
        $scope.history.push({type: "command", text: cmd});

        var response = model.doAction(cmd);

        $scope.history.push({type: "response", text: response});
    };
}
