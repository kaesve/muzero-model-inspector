<template>
  <canvas ref="canvas"></canvas>
</template>

<script>

const color = (r, g, b) => `rgb(${round(r*255)}, ${round(g*255)}, ${round(b*255)})`;

export default {
    props: [ "state", "config" ],
    data() {
        return {
            ctx: null
        }
    },
    mounted() {
        this.ctx = this.$refs.canvas.getContext("2d");
        this.draw();
    },
    methods: {
        draw() {
            let state = {
                x:  this.state[0],
                dX: this.state[1],
                a:  this.state[2],
                dA: this.state[3],
            };


            // const ctx = canvas.getContext("2d");

            const canvas = this.$refs.canvas;
            const viewDim = [ canvas.width, canvas.height ] = [ 600, 400 ];
            const viewR = scl(viewDim, 0.5);


            let simConfig = {
                gravity: 9.8,
                cartMass: 1,
                poleMass: 0.1,
                poleLength: 0.5,
                forceMag: 10,
                td: 0.02,
                kinematicsIntegrator: "euler",

                angularThreshold: 12*TAU/360,
                xTreshold: 2.4
            };
            let simProps = {
                totalMass: simConfig.cartMass + simConfig.poleMass,
                poleMassLength: simConfig.poleMass*simConfig.poleLength,
                worldWidth: 2*simConfig.xTreshold
            };
            let ctx = this.ctx;

            let scale = viewDim[X]/simProps.worldWidth;
            let p = [ state.x, viewDim[Y] - 100 + 0.5 ];
            
            let cartDim = [ 50, 30 ];
            let cartR = scl(cartDim, 0.5);

            let poleDim = [ 10, scale * 2 * simConfig.poleLength ];
            let axleOffset = cartDim[Y] / 4;

            ctx.clearRect(0, 0, ...viewDim);
            
            ctx.save();

            ctx.translate(viewDim[X]/2, 0)

            ctx.beginPath();
            ctx.moveTo(-viewR[X], p[Y]);
            ctx.lineTo( viewR[X], p[Y]);
            ctx.stroke();

            ctx.translate(...p);
            ctx.fillRect(...scl(cartR, -1), ...cartDim);

            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(state.dX, 0);
            ctx.strokeStyle = 'red';
            ctx.stroke();

            ctx.translate(0, -axleOffset);
            ctx.rotate(PI + state.a);

            ctx.fillStyle = color(.8, .6, .4);
            ctx.fillRect(-poleDim[X]/2, 0, ...poleDim);


            ctx.fillStyle = color(.5, .5, .8);
            ctx.beginPath();
            ctx.arc(0, 0, 5, 0, TAU);
            ctx.fill();


            ctx.beginPath();
            ctx.arc(0, 0, poleDim[Y]*0.95, PI/2, PI/2 + state.dA, state.dA < 0);
            ctx.stroke();
            // ctx.fillRect(...scl(cartR, -1), ...cartDim);


            ctx.restore();

        }
    },
    watch: {
        state() {
            this.draw();
        }
    }
}
</script>

<style>

</style>