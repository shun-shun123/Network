/* 
+ Particle(円1つ)を表現するクラス
*/
class Particle {
    /*
    * this.relativePosition: ParticleManagerのBasePointからの相対位置
    * this.absolutePosition: 標準状態の座標軸での絶対位置
    * this.size: particleの円のサイズ
    */
    constructor(_position, _size) {
        this.relativePosition = _position;
        this.absolutePosition = createVector(0, 0);
        this.size = _size;
    }
    
    /* 
    * ParticleManagerのBasePositionとrelativePositionの加算によりabsolutePositionを算出するメソッド
    * managerBasePos: 自分を管理しているParticleManagerのBasePosition
    */ 
    update(managerBasePos) {
        this.absolutePosition = p5.Vector.add(this.relativePosition, managerBasePos);
    }
    
    /*
    * Particleを描画する
    */
    display() {
        ellipse(this.absolutePosition.x, this.absolutePosition.y, this.size);
    }
}

const PARTICLE_NUM = 18;
const speed = 2;
/*
* 多数のParticleを監視するクラス
*/ 
class ParticleManager {
    /* 
    * basePosition: 管理するParticleの中心位置
    * hue: 管理するParticleの彩度
    * radius: 円の半径(size指定するのはMainParticleManagerのみ nullの場合はランダムなサイズを生成)
    * particles: PARTICLE_NUM個のParticleを生成し、管理するParticleの配列
    * velocity: 移動速度
    */
    constructor(_position, _hue, _size) {
        this.basePosition = _position;
        this.hue = _hue;
        this.radius = _size || random(50, 150);
        this.particles = [];
        this.velocity = createVector(random(-speed, speed), random(-speed, speed));
        var angle = 0;
        var angleStep = 2 * PI / PARTICLE_NUM;
        for (var i = 0; i < PARTICLE_NUM; i++) {
            var particlePos = createVector(cos(angle) * this.radius, sin(angle) * this.radius);
            this.particles[i] = new Particle(particlePos, 10, radians(angle));
            angle += angleStep;
        }
    }
    
    /* 
    * ParticleManagerの移動、それに伴なう各Particleの絶対位置を更新するメソッドの呼び出し、跳ね返り判定を行う
    */
    update() {
        this.basePosition.add(this.velocity);
        this.particlesUpdate();
        if (this.basePosition.x < this.radius || this.basePosition.x > width - this.radius) {
            this.velocity.x *= -1;
        }
        if (this.basePosition.y < this.radius || this.basePosition.y > height - this.radius) {
            this.velocity.y *= -1;
        }
    }
    
    /* 
    * 管理するParticle全ての絶対位置の更新を行う
    */ 
    particlesUpdate() {
        for (var i = 0; i < this.particles.length; i++) {
            this.particles[i].update(this.basePosition);
        }
    }
    
    /* 
    * 管理するParticleを数珠つなぎする
    */ 
    connectMyGroup() {
        for (var i = 0; i < this.particles.length; i++) {
            var startPos = this.particles[i].absolutePosition;
            var index = i + 1;
            if (index == this.particles.length) {
                index = 0;
            }
            var endPos = this.particles[index].absolutePosition;
            line(startPos.x, startPos.y, endPos.x, endPos.y);
        }
    }

    /* 
    * 管理するParticleを描画する
    */
    display() {
        push();
        this.coloring();
        this.update();
        this.connectMyGroup();
        for (var i = 0; i < PARTICLE_NUM; i++) {
            this.particles[i].display();
        }
        pop();
    }
    
    /* 
    * ParticleManagerが管理するものの描画色を反映する
    * 変更が他に及ばないように利用範囲ではpush()-pop()を用いる
    */
    coloring() {
        fill(this.hue, 255, 255);
        stroke(this.hue, 255, 255);
    }
}

/* 
* ParticleManagerを管理するクラス
*/ 
const HIT_FIELD = 50;   // MainParticleManagerの当たり判定の中心距離
class NodeManager {
    /* 
    * particleManagers: ParticleManagerを管理する配列
    * particles: 各ParticleManagerが管理するParticleを保持する2次元配列
    */ 
    constructor(_particleManagers) {
        this.particleManagers = _particleManagers;
        this.particles = [];
        for (var i = 0; i < this.particleManagers.length; i++) {
            this.particles[i] = this.particleManagers[i].particles;
        }
    }
    
    /* 
    * MainParticleManagerと他のParticleManagerとの衝突判定と衝突処理を行う
    */ 
    update() {
        // MainParticleManagerは配列の最後に格納
        let mainParticleManagerIndex = this.particleManagers.length - 1;
        for (var i = 0; i < this.particleManagers.length - 1; i++) {
            if (p5.Vector.dist(this.particleManagers[i].basePosition, this.particleManagers[mainParticleManagerIndex].basePosition) < HIT_FIELD) {
                this.particleManagers[mainParticleManagerIndex].growUp(1.1);
                this.particleManagers.splice(i, 1);
                this.particles.splice(i, 1);
                break;
            }
        }
    }

    /* 
    * 管理する全てのParticleManagerに対し描画処理を依頼する
    */ 
    display() {
        this.update();
        for (var i = 0; i < this.particleManagers.length; i++) {
            this.particleManagers[i].display();
            push();
            this.coloring(i);
            strokeWeight(0.5);
            for (var j = 0; j < PARTICLE_NUM; j++) {
                var startPos = this.particles[i][j].absolutePosition;
                var index = i + 1;
                if (index == this.particleManagers.length) {
                    index = 0;
                }
                var endPos = this.particles[index][j].absolutePosition;
                line(startPos.x, startPos.y, endPos.x, endPos.y);
            }
            pop();
        }
    }
    
    /* 
    * Node間の繋がりを表す線の描画色を反映する
    * 変更が他に及ばないように利用範囲ではpush()-pop()を用いる
    */
    coloring(index) {
        stroke(this.particleManagers[index].hue, 255, 255);
    }
}

/*
* 成長するParticleManagerを継承した唯一のMainParticleManager
* ParticleManagerの配列の一番最後に追加しなければならない
*/
class MainParticleManager extends ParticleManager {
    /* 
    * sizeを他のParticleManagerより小さい範囲で乱数を生成する
    */ 
    constructor(_position, _hue) {
        super(_position, _hue, random(10, 30));
    }

    /*
    * ParticleManagerと違い最初は白のまま全てのParticleを描画する
    */
    display() {
        push();
        this.update();
        this.connectMyGroup();
        fill(255, 0, 255);
        for (var i = 0; i < PARTICLE_NUM; i++) {
            this.particles[i].display();
        }
        pop();
    }
    
    /*
    * _size: ParticleManagerのradiusの成長度合い(乗算により拡大される)
    */
    growUp(_size) {
        for (var i = 0; i < this.particles.length; i++) {
            this.particles[i].relativePosition.mult(_size);
        }
        this.radius = this.particles[0].relativePosition.mag();
    }
}

/*
* 以下メインプログラム
*
*/
var particleManager = [];
var nodeManager;
var NUM_OF_NODE = 30;
function setup() {
    createCanvas(windowWidth, windowHeight);
    colorMode(HSB, 255);
    for (var i = 0; i < NUM_OF_NODE; i++) {
        particleManager[i] = new ParticleManager(createVector(random(150, width - 150), random(150, height - 150)), random(255));
    }
    particleManager.push(new MainParticleManager(createVector(random(150, width - 150), random(150, height - 150)), 255));
    nodeManager = new NodeManager(particleManager);
}

function draw() {
    blendMode(BLEND);
    background(0, 30);
    blendMode(ADD);
    nodeManager.display();
}