$(document).ready(async function () {
	await loadFull(tsParticles);

	$("#tsparticles")
		.particles()
		.init({
			background: {
				color: {
					value: "#000000",
				},
			},
			fpsLimit: 240,
			particles: {
				groups: {
					z5000: {
						number: {
							value: 70,
						},
						zIndex: {
							value: 5000,
						},
					},
					z7500: {
						number: {
							value: 30,
						},
						zIndex: {
							value: 75,
						},
					},
					z2500: {
						number: {
							value: 50,
						},
						zIndex: {
							value: 25,
						},
					},
					z1000: {
						number: {
							value: 40,
						},
						zIndex: {
							value: 10,
						},
					},
				},
				number: {
					value: 400,
					density: {
						enable: false,
						value_area: 800,
					},
				},
				color: {
					value: "#fff",
					animation: {
						enable: false,
						speed: 20,
						sync: true,
					},
				},
				shape: {
					type: "circle",
				},
				opacity: {
					value: 1,
					random: false,
					animation: {
						enable: false,
						speed: 3,
						minimumValue: 0.1,
						sync: false,
					},
				},
				size: {
					value: 1,
				},
				links: {
					enable: false,
					distance: 100,
					color: "#ffffff",
					opacity: 0.4,
					width: 1,
				},
				move: {
					angle: {
						value: 10,
						offset: 0,
					},
					enable: true,
					speed: 1,
					direction: "right",
					random: false,
					straight: true,
					outModes: {
						default: "out",
					},
					attract: {
						enable: false,
						rotateX: 600,
						rotateY: 1200,
					},
				},
				zIndex: {
					value: 5,
					opacityRate: 0.5,
				},
			},

			detectRetina: true,
			emitters: {
				position: {
					y: 55,
					x: -30,
				},
				rate: {
					delay: 7,
					quantity: 1,
				},
				size: {
					width: 0,
					height: 0,
				},
			},
		});
});
