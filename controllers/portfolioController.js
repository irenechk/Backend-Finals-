const User = require("../models/User");
const Milestone = require("../models/Milestone");
const Gig = require("../models/Gig");

/**
 * @desc    Get all Freelancers for discovery marketplace with search and filters
 * @route   GET /api/portfolio
 * @access  Public
 */
const getAllFreelancers = async (req, res, next) => {
    try {
        const { search, category, skill } = req.query;

        const query = { role: "freelancer" };

        if (category && category !== "All" && category.trim() !== "") {
            query.category = { $regex: new RegExp(`^${category.trim()}$`, "i") };
        }

        if (skill && skill.trim() !== "") {
            query.skills = { $in: [new RegExp(skill.trim(), "i")] };
        }

        if (search && search.trim() !== "") {
            const regex = new RegExp(search.trim(), "i");
            query.$or = [
                { name: regex },
                { bio: regex },
                { title: regex },
                { category: regex },
                { skills: regex },
                { location: regex }
            ];
        }

        const freelancers = await User.find(query).select("-password").sort({ createdAt: -1 });

        // Collect stats from completed milestones
        const freelancerIds = freelancers.map((f) => f._id);
        const milestoneStats = await Milestone.aggregate([
            { $match: { freelancer: { $in: freelancerIds }, status: "completed" } },
            { $group: { _id: "$freelancer", count: { $sum: 1 }, earnings: { $sum: "$amount" } } }
        ]);

        const statsMap = {};
        milestoneStats.forEach((stat) => {
            statsMap[stat._id.toString()] = stat;
        });

        const formatted = freelancers.map((f) => {
            const stats = statsMap[f._id.toString()] || { count: 0, earnings: 0 };
            return {
                id: f._id,
                _id: f._id,
                name: f.name,
                email: f.email,
                role: f.role,
                title: f.title || "Specialist Freelancer",
                category: f.category || "Development & IT",
                bio: f.bio || "",
                skills: f.skills || [],
                experience: f.experience || "3+ years",
                location: f.location || "Remote",
                hourlyRate: typeof f.hourlyRate === "number" ? f.hourlyRate : 45,
                rating: typeof f.rating === "number" ? f.rating : 4.9,
                reviewsCount: typeof f.reviewsCount === "number" ? f.reviewsCount : 8,
                profileImage: f.profileImage || "",
                portfolio: f.portfolio || [],
                completedProjectsCount: Math.max(f.completedProjects || 0, stats.count),
                totalEarnings: stats.earnings,
                createdAt: f.createdAt
            };
        });

        res.status(200).json({
            success: true,
            count: formatted.length,
            message: "Freelancers retrieved successfully",
            data: { freelancers: formatted }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get Freelancer's public portfolio and work history
 * @route   GET /api/portfolio/:freelancerId
 * @access  Public
 */
const getFreelancerPortfolio = async (req, res, next) => {
    try {
        const freelancer = await User.findById(req.params.freelancerId).select("-password");

        if (!freelancer || freelancer.role !== "freelancer") {
            return res.status(404).json({
                success: false,
                message: "Freelancer profile not found"
            });
        }

        // Fetch completed milestones
        const completedMilestones = await Milestone.find({
            freelancer: freelancer._id,
            status: "completed"
        }).populate("gig", "title category");

        // Calculate total earnings
        const totalEarnings = completedMilestones.reduce((acc, curr) => acc + curr.amount, 0);

        res.status(200).json({
            success: true,
            message: "Freelancer portfolio retrieved successfully",
            data: {
                freelancer: {
                    id: freelancer._id,
                    _id: freelancer._id,
                    name: freelancer.name,
                    email: freelancer.email,
                    role: freelancer.role,
                    title: freelancer.title || "Specialist Freelancer",
                    category: freelancer.category || "Development & IT",
                    bio: freelancer.bio || "",
                    skills: freelancer.skills || [],
                    experience: freelancer.experience || "3+ years",
                    location: freelancer.location || "Remote",
                    hourlyRate: typeof freelancer.hourlyRate === "number" ? freelancer.hourlyRate : 45,
                    rating: typeof freelancer.rating === "number" ? freelancer.rating : 4.9,
                    reviewsCount: typeof freelancer.reviewsCount === "number" ? freelancer.reviewsCount : 8,
                    profileImage: freelancer.profileImage || "",
                    portfolio: freelancer.portfolio || [],
                    createdAt: freelancer.createdAt
                },
                stats: {
                    completedProjectsCount: Math.max(freelancer.completedProjects || 0, completedMilestones.length),
                    totalEarnings
                },
                completedMilestones
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update Freelancer's portfolio bio and skills
 * @route   PUT /api/portfolio
 * @access  Private (Freelancers only)
 */
const updatePortfolio = async (req, res, next) => {
    try {
        const {
            bio,
            skills,
            title,
            category,
            experience,
            location,
            hourlyRate,
            profileImage,
            portfolio
        } = req.body;

        const updateData = {};
        if (bio !== undefined) updateData.bio = bio;
        if (skills !== undefined && Array.isArray(skills)) updateData.skills = skills;
        if (title !== undefined) updateData.title = title;
        if (category !== undefined) updateData.category = category;
        if (experience !== undefined) updateData.experience = experience;
        if (location !== undefined) updateData.location = location;
        if (hourlyRate !== undefined) updateData.hourlyRate = Number(hourlyRate);
        if (profileImage !== undefined) updateData.profileImage = profileImage;
        if (portfolio !== undefined && Array.isArray(portfolio)) updateData.portfolio = portfolio;

        const user = await User.findByIdAndUpdate(
            req.user._id,
            updateData,
            { new: true }
        ).select("-password");

        res.status(200).json({
            success: true,
            message: "Portfolio updated successfully",
            data: { user }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllFreelancers,
    getFreelancerPortfolio,
    updatePortfolio
};
// req.query	Search/filter values
// req.params	Freelancer ID from URL
// req.body	Profile update data
// regex	Pattern-based text searching
// "i"	Case-insensitive matching
// $or	Any condition can match
// $in	Checks whether a value matches something in an array/list
// $match	Filters documents in aggregation
// $group	Groups documents and calculates values
// $sum	Adds values
// map()	Creates a new array from existing items
// reduce()	Combines array values into one result
// select("-password")	Excludes password
// { new: true }	Returns updated document
// 🎤 One-line viva answer

// portfolioController.js manages freelancer discovery, searching and filtering, public portfolios, completed-project statistics, earnings, and freelancer profile updates.