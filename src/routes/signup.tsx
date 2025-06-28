import { useMutation } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import {
	createRoute,
	useNavigate,
	useSearch,
	type RootRoute,
} from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import React, { useState } from "react";

function SignUpPage() {
	const [formData, setFormData] = useState({
		username: "",
		firstName: "",
		lastName: "",
		email: "",
		password: "",
		confirmPassword: "",
	});

	const { redirect } = useSearch({
		from: "/signup",
	});
	const navigate = useNavigate();

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prevData) => ({
			...prevData,
			[name]: value,
		}));
	};

	const { mutate } = useMutation({
		mutationFn: async () => {
			const res = await apiClient.post("/user", {
				username: formData.username,
				password: formData.password,
				first_name: formData.firstName,
				last_name: formData.lastName,
				email: formData.email,
			});
			return res.data;
		},
		onSuccess: (data) => {
			setFormData({
				username: "",
				firstName: "",
				lastName: "",
				email: "",
				password: "",
				confirmPassword: "",
			});
			navigate({
				to: redirect ?? "/",
			});
		},
    onError: (err) => {
      console.error(err);
    }
	});

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (formData.password !== formData.confirmPassword) {
			alert("Passwords do not match!");
			return;
		}

		mutate();
	};

	return (
		<div className="flex items-center justify-center min-h-screen bg-base-200 p-4">
			<div className="card w-full max-w-lg shadow-2xl bg-base-100 rounded-lg">
				<div className="card-body p-8">
					<h2 className="card-title text-4xl font-extrabold text-center block mb-8 text-primary">
						Create Your Account
					</h2>

					<form onSubmit={handleSubmit} className="space-y-6">
						<div className="form-control">
							<label htmlFor="username" className="label">
								<span className="label-text">Username</span>
							</label>
							<input
								name="username"
								type="text"
								placeholder="Choose a username"
								className="input input-bordered w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
								value={formData.username}
								onChange={handleChange}
								required
							/>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="form-control">
								<label htmlFor="firstName" className="label">
									<span className="label-text">First Name</span>
								</label>
								<input
									name="firstName"
									type="text"
									placeholder="Enter your first name"
									className="input input-bordered w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
									value={formData.firstName}
									onChange={handleChange}
									required
								/>
							</div>
							<div className="form-control">
								<label htmlFor="lastName" className="label">
									<span className="label-text">Last Name</span>
								</label>
								<input
									name="lastName"
									type="text"
									placeholder="Enter your last name"
									className="input input-bordered w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
									value={formData.lastName}
									onChange={handleChange}
									required
								/>
							</div>
						</div>

						<div className="form-control">
							<label htmlFor="email" className="label">
								<span className="label-text">Email</span>
							</label>
							<input
								name="email"
								type="email"
								placeholder="Enter your email"
								className="input input-bordered w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
								value={formData.email}
								onChange={handleChange}
								required
							/>
						</div>

						<div className="form-control">
							<label htmlFor="password" className="label">
								<span className="label-text">Password</span>
							</label>
							<input
								name="password"
								type="password"
								placeholder="Enter your password"
								className="input input-bordered w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
								value={formData.password}
								onChange={handleChange}
								required
							/>
						</div>

						<div className="form-control">
							<label htmlFor="confirmPassword" className="label">
								<span className="label-text">Confirm Password</span>
							</label>
							<input
								name="confirmPassword"
								type="password"
								placeholder="Confirm your password"
								className="input input-bordered w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
								value={formData.confirmPassword}
								onChange={handleChange}
								required
							/>
						</div>

						<div className="pt-2">
							<button type="submit" className="btn btn-primary w-full text-lg">
								Register
							</button>
						</div>
					</form>

					<p className="text-center text-sm mt-8">
						Already have an account?{" "}
						<Link
							to="/login"
							search={{ redirect }}
							className="link link-hover text-primary font-medium"
						>
							Login
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
}

export default (parentRoute: RootRoute) =>
	createRoute({
		path: "/signup",
		component: SignUpPage,
		getParentRoute: () => parentRoute,
		validateSearch: (search) => {
			const redirectUrl = search?.redirect as string | undefined;
			return {
				redirect: redirectUrl ?? null,
			};
		},
	});
